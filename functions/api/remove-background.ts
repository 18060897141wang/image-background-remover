import { Env, getCurrentUser, jsonError } from "../_lib/auth";

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

  const removeBgForm = new FormData();
  removeBgForm.append("image_file", image);
  removeBgForm.append("size", "auto");
  removeBgForm.append("format", "png");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": env.REMOVE_BG_API_KEY
    },
    body: removeBgForm
  });

  if (!response.ok) {
    let detail = "Background removal failed. Please try again.";

    try {
      const body = (await response.json()) as {
        errors?: Array<{ title?: string }>;
      };
      const errors = body?.errors;

      if (Array.isArray(errors) && errors[0]?.title) {
        detail = errors[0].title;
      }
    } catch {
      // Keep the generic message when Remove.bg does not return JSON.
    }

    return jsonError(detail, response.status);
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
