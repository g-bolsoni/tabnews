import mail from "infra/mail";
import orchestrator from "../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("Integration Mail", () => {
  test("Integration Mail Integration", async () => {
    await mail.sendMail({
      from: "GBMoney <giovane.essado@gmail.com>",
      to: "contato@gbmoney.com",
      subject: "Teste assunto",
      text: `Teste de corpo`,
    });
    await mail.sendMail({
      from: "GBMoney <giovane.essado@gmail.com>",
      to: "contato@gbmoney.com",
      subject: "Ultimo email enviado",
      text: `Ultimo corpo de email enviado`,
    });

    const lastMail = await orchestrator.getLastMail();

    expect(lastMail.sender).toBe("<giovane.essado@gmail.com>");
    expect(lastMail.recipients[0]).toBe("<contato@gbmoney.com>");
    expect(lastMail.subject).toBe("Ultimo email enviado");
    expect(lastMail.text).toBe("Ultimo corpo de email enviado\n");
  });
});
