import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import controller from "infra/controller";
import user from "models/user";
import session from "models/session";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  console.log("GET /api/v1/users");
  const cookieSession = req.cookies.session_id;
  if(!cookieSession) return res.status(401).json({ error: "Unauthorized" });

  const { user_id } = await session.findByToken(cookieSession);
  if(!user_id) return res.status(401).json({ error: "Unauthorized" });

  const userData = await user.findById(user_id);
  return res.status(200).json(userData);
}
async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const newUser = await user.create(userInputValues);

  return res.status(201).json(newUser);
}
