import { Env } from "./auth";

const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";
const REMOVE_BG_ACCOUNT_URL = "https://api.remove.bg/v1.0/account";
const REMOVE_BG_TIMEOUT_MS = 60000;

export class RemoveBgError extends Error {
  code: string;
  status: number;
  requestId: string | null;

  constructor(code: string, message: string, status = 502, requestId: string | null = null) {
    super(message);
    this.name = "RemoveBgError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

export interface RemoveBgSuccess {
  body: ReadableStream<Uint8Array> | null;
  status: number;
  creditsCharged: number | null;
  requestId: string | null;
}

function parseRemoveBgError(body: unknown) {
  const errors = (body as { errors?: Array<{ title?: string; code?: string }> })?.errors;

  if (!Array.isArray(errors) || !errors[0]) {
    return { title: "", code: "" };
  }

  return {
    title: errors[0].title ?? "",
    code: errors[0].code ?? ""
  };
}

function classifyRemoveBgFailure(status: number, body: unknown, requestId: string | null) {
  const parsed = parseRemoveBgError(body);
  const raw = `${parsed.code} ${parsed.title}`.toLowerCase();

  if (status === 401 || status === 403) {
    return new RemoveBgError(
      "remove_bg_api_key_invalid",
      "Background removal is temporarily unavailable. Please contact support.",
      503,
      requestId
    );
  }

  if (status === 402 || raw.includes("insufficient") || raw.includes("credit")) {
    return new RemoveBgError(
      "remove_bg_insufficient_quota",
      "Background removal is temporarily unavailable because the processing quota is low. Please try again later.",
      503,
      requestId
    );
  }

  if (status === 400 || status === 415 || raw.includes("unsupported")) {
    return new RemoveBgError(
      "remove_bg_unsupported_image",
      "This image could not be processed. Please try another JPG, PNG, or WebP image.",
      422,
      requestId
    );
  }

  if (status === 413 || raw.includes("too large")) {
    return new RemoveBgError(
      "remove_bg_file_too_large",
      "The image is too large for background removal. Please upload a smaller image.",
      413,
      requestId
    );
  }

  return new RemoveBgError(
    "remove_bg_upstream_error",
    "Background removal is temporarily unavailable. Please try again later.",
    status >= 500 ? 503 : 502,
    requestId
  );
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function removeImageBackground(env: Env, image: File): Promise<RemoveBgSuccess> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REMOVE_BG_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("image_file", image);
    formData.append("size", "auto");
    formData.append("format", "png");

    const response = await fetch(REMOVE_BG_API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": env.REMOVE_BG_API_KEY
      },
      body: formData,
      signal: controller.signal
    });
    const requestId = response.headers.get("X-Request-Id");

    if (!response.ok) {
      throw classifyRemoveBgFailure(response.status, await readJsonSafely(response), requestId);
    }

    const creditsHeader = response.headers.get("X-Credits-Charged");
    const creditsCharged = creditsHeader ? Number(creditsHeader) : null;

    return {
      body: response.body,
      status: response.status,
      creditsCharged: Number.isFinite(creditsCharged) ? creditsCharged : null,
      requestId
    };
  } catch (error) {
    if (error instanceof RemoveBgError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RemoveBgError(
        "remove_bg_timeout",
        "Background removal timed out. Your credit was not charged. Please try again.",
        504
      );
    }

    throw new RemoveBgError(
      "remove_bg_network_error",
      "Background removal is temporarily unavailable. Your credit was not charged.",
      503
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkRemoveBgAccount(env: Env) {
  const response = await fetch(REMOVE_BG_ACCOUNT_URL, {
    headers: {
      "X-Api-Key": env.REMOVE_BG_API_KEY
    }
  });
  const now = new Date().toISOString();

  if (!response.ok) {
    await env.DB.prepare(
      `INSERT OR REPLACE INTO remove_bg_account_status
        (id, available_credits, low_balance_threshold, status, error_code, error_message, checked_at, updated_at)
       VALUES (1, NULL, ?, 'error', ?, ?, ?, ?)`
    )
      .bind(
        Number(env.REMOVE_BG_LOW_BALANCE_THRESHOLD ?? 20),
        `http_${response.status}`,
        "Failed to query remove.bg account status.",
        now,
        now
      )
      .run();

    return null;
  }

  const data = (await response.json().catch(() => null)) as {
    data?: {
      attributes?: {
        credits?: {
          total?: number;
          subscription?: number;
          payg?: number;
          enterprise?: number;
        };
      };
    };
  } | null;
  const credits = data?.data?.attributes?.credits;
  const availableCredits = Number(
    credits?.total ?? Number(credits?.subscription ?? 0) + Number(credits?.payg ?? 0) + Number(credits?.enterprise ?? 0)
  );
  const threshold = Number(env.REMOVE_BG_LOW_BALANCE_THRESHOLD ?? 20);
  const status =
    Number.isFinite(availableCredits) && availableCredits <= threshold ? "low_balance" : "ok";

  await env.DB.prepare(
    `INSERT OR REPLACE INTO remove_bg_account_status
      (id, available_credits, low_balance_threshold, status, error_code, error_message, checked_at, updated_at)
     VALUES (1, ?, ?, ?, NULL, NULL, ?, ?)`
  )
    .bind(Number.isFinite(availableCredits) ? availableCredits : null, threshold, status, now, now)
    .run();

  return {
    availableCredits: Number.isFinite(availableCredits) ? availableCredits : null,
    status
  };
}
