import { status } from '@grpc/grpc-js';
import { HttpStatus } from '@nestjs/common/enums';

import type { IException } from '../entity/exception.interface';

import { Exception } from '../entity/Exception';

export class ExceptionFactory {
  static notFound(message: string): IException {
    return new Exception(message, status.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string): IException {
    return new Exception(message, status.ALREADY_EXISTS, HttpStatus.CONFLICT);
  }

  static invalidArgument(message: string): IException {
    return new Exception(
      message,
      status.INVALID_ARGUMENT,
      HttpStatus.BAD_REQUEST,
    );
  }

  static internal(message: string): IException {
    return new Exception(
      message,
      status.INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static unauthorized(message: string): IException {
    return new Exception(
      message,
      status.UNAUTHENTICATED,
      HttpStatus.UNAUTHORIZED,
    );
  }

  static forbidden(message: string): IException {
    return new Exception(
      message,
      status.PERMISSION_DENIED,
      HttpStatus.FORBIDDEN,
    );
  }

  static nonAcceptable(message: string): IException {
    return new Exception(
      message,
      status.FAILED_PRECONDITION,
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
