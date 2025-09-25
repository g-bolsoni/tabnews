import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import password from "models/password";
import { UnauthorizedError } from "infra/error";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function postHandler(req, res) {
  const userInputValues = req.body;

  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);
    const isPasswordValid = await password.compare(
      userInputValues.password,
      storedUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados informados e tente novamente.",
      });
    }

    console.log(isPasswordValid);
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autenticação não conferem.",
      action: "Verifique os dados informados e tente novamente.",
    });
  }

  return res.status(201).json({});
}
