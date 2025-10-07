import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function postHandler(req, res) {
  const userInputValues = req.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  return res.status(201).json({});
}
