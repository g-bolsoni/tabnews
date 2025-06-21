import { InternalServerError, MethodNotAllowedError } from "infra/error";

function onErrorHandler(error, req, res) {
  const publicErrorObject = new InternalServerError({
    status_code: error.status_code,
    cause: error,
  });
  console.error(publicErrorObject);
  res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.status_code).json(publicErrorObject);
}

const controller = {
  onErrorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
