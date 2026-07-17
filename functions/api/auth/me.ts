import { Env, getCurrentUser } from "../../_lib/auth";
import { getAvailableCredits } from "../../_lib/credits";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getCurrentUser(request, env);
  const credits = user ? await getAvailableCredits(env, user.id) : 0;

  return Response.json({ user, credits });
};
