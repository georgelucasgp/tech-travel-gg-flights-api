import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: FastifyReply = ctx.getResponse<FastifyReply>();
    const request: FastifyRequest = ctx.getRequest<FastifyRequest>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.error(`HTTP Exception: ${exception.constructor.name}`, {
      error: exception.message,
      status,
      path: request?.url || 'unknown',
      method: request?.method || 'unknown',
    });

    let message = exception.message;
    let error: string | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      message = responseObj.message as string;
      error = responseObj.error as string | undefined;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url || 'unknown',
      method: request?.method || 'unknown',
      message,
      ...(error && { error }),
    };

    response.status(status).send(errorResponse);
  }
}
