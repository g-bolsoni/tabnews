import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import controller from "../../../../../infra/controller";
import activation from "../../../../../infra/activations";

const router = createRouter();
router.patch(patchHandler)

export default router.handler(controller.onErrorHandlers);

async function patchHandler(req: NextApiRequest, res: NextApiResponse) {
  const activationTokenId = req.query.token_id;

  const validActivationToken = await activation.findOneValidById(activationTokenId);
  const usedActivationToken = await activation.markTokenAsUsed(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  return res.status(200).json(usedActivationToken)
}

