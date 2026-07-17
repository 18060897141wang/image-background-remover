import { Env } from "../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    googleClientId: env.GOOGLE_CLIENT_ID || ""
  });
};
