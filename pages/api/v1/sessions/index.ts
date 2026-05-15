import * as cookie from "cookie";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import type { NextApiRequest, NextApiResponse } from "next";
import { EXPIRATION_IN_MILLISECONDS } from "../../../../constants";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const { id } = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const userSession = await session.create(id);

  const setCookie = cookie.serialize("session_id", userSession.token, {
    path: "/",
    maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
  return res.status(201).json(userSession);
}
