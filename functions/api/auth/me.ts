import { Env, getCurrentUser } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getCurrentUser(request, env);

  return Response.json({ user });
};
