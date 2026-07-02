import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import type { NextApiRequest, NextApiResponse } from "next";

const router = createRouter();
router.post(postHandler).delete(deleteHandler);

export default router.handler(controller.onErrorHandlers);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const { id } = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const userSession = await session.create(id);

  await controller.setSessionCookie(userSession.token, res);

  return res.status(201).json(userSession);
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies.session_id;
  const session_object = await session.findByToken(sessionToken);
  const expiresSession = await session.expireByID(session_object.id);
  await controller.clearSessionCookie(res);

  return res.status(200).json(expiresSession);
}
