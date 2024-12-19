interface ErrorConfig {
  name?: string;
  message: string;
  action?: string;
  statusCode?: number;
}

class CustomErrors extends Error {
  action = "";
  status_code = 500;

  constructor({ name, message, action, statusCode }: ErrorConfig) {
    super(message);
    this.name = this.constructor.name;
    this.action = action;
    this.status_code = statusCode;

    Object.assign(this, {
      error_name: name,
      error_message: message,
    });
  }
}

export default CustomErrors;
