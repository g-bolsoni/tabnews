import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function postHandler(req, res) {
  const userInputValues = req.body;

  const { id } = await authentication.getAuthenticatedUser(userInputValues.email,userInputValues.password);
  const userSession = await session.create(id);

  return res.status(201).json(userSession);
}
