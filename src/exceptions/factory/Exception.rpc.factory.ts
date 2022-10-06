import { status } from '@grpc/grpc-js';
import { HttpStatus } from '@nestjs/common';

import type { IException } from '../entity/exception.interface';

import { ExceptionRpc } from '../entity/Exceptions-rpc';

export class ExceptionRpcFactory {
  static notFound(message: string): IException {
    return new ExceptionRpc(message, status.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string): IException {
    return new ExceptionRpc(
      message,
      status.ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }

  static invalidArgument(message: string): IException {
    return new ExceptionRpc(
      message,
      status.INVALID_ARGUMENT,
      HttpStatus.BAD_REQUEST,
    );
  }

  static internal(message: string): IException {
    return new ExceptionRpc(
      message,
      status.INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
