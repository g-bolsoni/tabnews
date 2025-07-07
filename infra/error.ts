export class InternalServerError extends Error {
  action: string;
  status_code: number;

  constructor({ cause, status_code }) {
    super("Um erro interno não esperado aconteceu.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.status_code = status_code || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class MethodNotAllowedError extends Error {
  action: string;
  status_code: number;

  constructor() {
    super("Método não permitido para esse endpoint.");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é valido para este endpoint";
    this.status_code = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ServiceError extends Error {
  action: string;
  status_code: number;

  constructor({ cause, message }) {
    super(message || "Serviço indisponível no momento.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponivel";
    this.status_code = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ValidationError extends Error {
  action: string;
  status_code: number;

  constructor({ cause, message, action }) {
    super(message || "Um erro de validação ocorreu.", {
      cause,
    });

    this.name = "ValidationError";
    this.action = action || "Ajuste os dados enviados e tente novamente.";
    this.status_code = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class NotFoundError extends Error {
  action: string;
  status_code: number;

  constructor({ cause, message, action }) {
    super(message || "Não foi possível encontrar este recurso no sistema.", {
      cause,
    });

    this.name = "NotFoundError";
    this.action =
      action || "Verifique se os parâmetros enviados na consulta estão certos;";
    this.status_code = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}
