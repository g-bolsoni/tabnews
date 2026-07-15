import { EXPIRATION_IN_MILLISECONDS } from "../constants";
import * as cookie from "cookie";

import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError
} from "infra/error";
import { NextApiRequest, NextApiResponse} from "next";
import session from "../models/session";
import user from "../models/user";

function onErrorHandler(error: any, req: NextApiRequest, res: NextApiResponse) {
  if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
    return res.status(error.status_code).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(res);
    return res.status(error.status_code).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);
  res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onNoMatchHandler(req: NextApiRequest, res: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function clearSessionCookie(res: NextApiResponse) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
}

async function setSessionCookie(sessionToken: string, res: NextApiResponse) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(req: NextApiRequest, res: NextApiResponse, next) {
  let userData;

  if(req.cookies?.session_id) userData = await injectAuthenticatedUser(req.cookies.session_id)
  else userData =  await injectAnonymousUser()

  req.context = {
    ...req.context,
    user: userData,
  }
  return next();
}

async function injectAuthenticatedUser(sessionToken: string) {
  const sessionObj = await session.findByToken(sessionToken);
  return await  user.findById(sessionObj.user_id);
}
async function injectAnonymousUser() {
  return {
    features: [
      'read:activation_token',
      'create:session',
      'create:user',
    ]
  }
}

function canRequest(feature:string) {
  return function canRequestMiddleware(req, res, next) {
    const userTryingToRequest = req.context.user;

    if(userTryingToRequest.features.includes(feature)) return next();

    throw new ForbiddenError({
      message: "Você não possui permissão para executar essa ação.",
      action: `Verifique se seu usuário possui a feature "${feature}"`
    })

  }
}

const controller = {
  onErrorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest
};

export default controller;
