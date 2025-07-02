import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaUtils } from '../database/prisma.utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: any;
}

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: FastifyReply = ctx.getResponse<FastifyReply>();
    const request: FastifyRequest = ctx.getRequest<FastifyRequest>();

    try {
      const httpException =
        PrismaUtils.getHttpExceptionFromPrismaError(exception);
      const status = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();

      this.logger.error(`Prisma error caught: ${exception}`);

      let message = 'Database error occurred';
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = String(exceptionResponse.message);
      }

      const errorResponse: ErrorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request?.url || 'unknown',
        method: request?.method || 'unknown',
        message,
      };

      response.status(status).send(errorResponse);
    } catch (error) {
      this.logger.error('Error in PrismaExceptionFilter', error);
      response.status(500).send({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request?.url || 'unknown',
        method: request?.method || 'unknown',
        message: 'Internal server error',
      });
    }
  }
}
