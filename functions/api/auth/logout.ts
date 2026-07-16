import { Env, clearSessionCookie, deleteCurrentSession } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  await deleteCurrentSession(request, env);

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookie()
      }
    }
  );
};
