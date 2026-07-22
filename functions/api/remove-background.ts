import {
  confirmReservedCredit,
  refundReservedCredit,
  reserveCredit
} from "../_lib/credits";
import { Env, getCurrentUser, jsonError } from "../_lib/auth";
import {
  completeProcessingTask,
  createProcessingTask,
  failProcessingTask
} from "../_lib/processing-tasks";
import { RemoveBgError, removeImageBackground } from "../_lib/remove-bg";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.REMOVE_BG_API_KEY) {
    return jsonError("Remove.bg API key is not configured.", 500);
  }

  const user = await getCurrentUser(request, env);

  if (!user) {
    return jsonError("Please sign in with Google before removing backgrounds.", 401);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid upload request.");
  }

  const image = formData.get("image");

  if (!(image instanceof File)) {
    return jsonError("Please upload an image.");
  }

  if (!SUPPORTED_TYPES.has(image.type)) {
    return jsonError("Please upload a JPG, PNG, or WebP image.");
  }

  if (image.size > MAX_FILE_SIZE) {
    return jsonError("The image is too large. Please upload an image under 10MB.");
  }

  const idempotencyKey =
    request.headers.get("Idempotency-Key") ||
    request.headers.get("X-Idempotency-Key") ||
    String(formData.get("idempotencyKey") ?? "");

  if (!idempotencyKey) {
    return jsonError("Missing upload request id. Please choose the image again.");
  }

  const { task, created } = await createProcessingTask(env, user.id, idempotencyKey, image);

  if (!task) {
    return jsonError("Background removal could not be started. Please try again.", 500);
  }

  if (!created) {
    if (task.status === "processing") {
      return jsonError("This image is already being processed. Please wait a moment.", 409);
    }

    if (task.status === "completed") {
      return jsonError(
        "This request was already completed. Please upload the image again to create a new result.",
        409
      );
    }

    return jsonError(task.error_message || "This request already failed. Please try again.", 409);
  }

  const reserved = await reserveCredit(env, user.id, task.id);

  if (!reserved) {
    await failProcessingTask(env, task.id, {
      errorCode: "insufficient_user_credits",
      errorMessage: "You do not have enough credits. Please buy more credits.",
      removeBgStatusCode: null,
      removeBgRequestId: null
    });
    return jsonError("You do not have enough credits. Please buy more credits.", 402);
  }

  try {
    const result = await removeImageBackground(env, image);
    await confirmReservedCredit(env, task.id);
    await completeProcessingTask(env, task.id, {
      removeBgCreditsCharged: result.creditsCharged,
      removeBgStatusCode: result.status,
      removeBgRequestId: result.requestId
    });

    return new Response(result.body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    await refundReservedCredit(env, user.id, task.id);

    const removeBgError =
      error instanceof RemoveBgError
        ? error
        : new RemoveBgError(
            "remove_bg_unknown_error",
            "Background removal failed. Your credit was not charged.",
            503
          );

    await failProcessingTask(env, task.id, {
      errorCode: removeBgError.code,
      errorMessage: removeBgError.message,
      removeBgStatusCode: removeBgError.status,
      removeBgRequestId: removeBgError.requestId
    });

    return jsonError(removeBgError.message, removeBgError.status);
  }
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
