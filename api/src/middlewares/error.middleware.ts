import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { ApiResponse } from "../interfaces/api-response.interface";
import { ValidateError } from "tsoa";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof ValidateError) {
    status = 400;
    message = "Validation Failed";
    console.error(`Caught Validation Error for ${req.path}:`, err.fields);
  } else if (err instanceof ApiError) {
    status = err.code;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const response: ApiResponse = {
    success: false,
    message,
    code: status,
    data: null,
  };

  if (err instanceof ValidateError) {
    response.data = {
      fields: err.fields,
    };
  }

  res.status(status).json(response);
  console.error(err);
};
