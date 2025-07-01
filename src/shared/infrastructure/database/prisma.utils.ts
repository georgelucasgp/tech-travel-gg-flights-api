import { Prisma } from '../../../../generated/prisma/client';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

export class PrismaUtils {
  static getHttpExceptionFromPrismaError(error: any): HttpException {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new BadRequestException('Invalid input data');
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return new InternalServerErrorException('Unknown database request error');
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return new InternalServerErrorException('Critical Prisma engine error');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new InternalServerErrorException(
        'Database connection initialization error',
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : String(error || 'Unknown error');
    return new InternalServerErrorException(`Internal error: ${errorMessage}`);
  }

  private static handleKnownRequestError(
    error: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    const meta = error.meta || {};
    const constraint =
      typeof meta.constraint === 'string' ? meta.constraint : 'unknown';
    const fieldName =
      typeof meta.field_name === 'string' ? meta.field_name : 'unknown';
    const columnName =
      typeof meta.column_name === 'string' ? meta.column_name : 'unknown';
    const modelName =
      typeof meta.model_name === 'string' ? meta.model_name : 'unknown';
    const databaseError =
      typeof meta.database_error === 'string'
        ? meta.database_error
        : 'database_error';
    const fieldValue =
      typeof meta.field_value === 'string' ? meta.field_value : 'unknown';
    const path = typeof meta.path === 'string' ? meta.path : 'unknown';
    const argumentName =
      typeof meta.argument_name === 'string' ? meta.argument_name : 'unknown';
    const objectName =
      typeof meta.object_name === 'string' ? meta.object_name : 'unknown';
    const relationName =
      typeof meta.relation_name === 'string' ? meta.relation_name : 'unknown';
    const modelAName =
      typeof meta.model_a_name === 'string' ? meta.model_a_name : 'unknown';
    const modelBName =
      typeof meta.model_b_name === 'string' ? meta.model_b_name : 'unknown';
    const details = typeof meta.details === 'string' ? meta.details : 'unknown';
    const table = typeof meta.table === 'string' ? meta.table : 'unknown';
    const column = typeof meta.column === 'string' ? meta.column : 'unknown';
    const cause = typeof meta.cause === 'string' ? meta.cause : 'unknown';

    switch (error.code) {
      case 'P2002':
        return new ConflictException(
          `Unique constraint failed on: ${constraint} (field: ${fieldName})`,
        );
      case 'P2003':
        return new BadRequestException(
          `Foreign key constraint failed on: ${constraint} (field: ${fieldName})`,
        );
      case 'P2000':
        return new BadRequestException(
          `The provided value for the column is too long for the column's type. Column: ${columnName}`,
        );
      case 'P2001':
        return new NotFoundException(
          `The record searched for in the where condition (${modelName}) does not exist`,
        );
      case 'P2004':
        return new BadRequestException(
          `A constraint failed on the database: ${constraint} (field: ${fieldName}) ${databaseError}`,
        );
      case 'P2005':
        return new BadRequestException(
          `The value ${fieldValue} stored in the database for the field ${fieldName} is invalid for the field's type`,
        );
      case 'P2006':
        return new BadRequestException(
          `The provided value ${fieldValue} for ${modelName} field ${fieldName} is not valid`,
        );
      case 'P2011':
        return new BadRequestException(
          `Null constraint violation on the ${constraint}`,
        );
      case 'P2012':
        return new BadRequestException(`Missing a required value at ${path}`);
      case 'P2013':
        return new BadRequestException(
          `Missing the required argument ${argumentName} for field ${fieldName} on ${objectName}.`,
        );
      case 'P2014':
        return new BadRequestException(
          `The change you are trying to make would violate the required relation '${relationName}' between the ${modelAName} and ${modelBName} models.`,
        );
      case 'P2015':
        return new NotFoundException(
          `A related record could not be found. ${details}`,
        );
      case 'P2018':
        return new NotFoundException(
          `The required connected records were not found. ${details}`,
        );
      case 'P2021':
        return new InternalServerErrorException(
          `The table ${table} does not exist in the current database`,
        );
      case 'P2022':
        return new InternalServerErrorException(
          `The column ${column} does not exist in the current database`,
        );
      case 'P2025':
        return new NotFoundException(
          `An operation failed because it depends on one or more records that were required but not found. Cause: ${cause}`,
        );
      default:
        return new InternalServerErrorException(
          `Database error (${error.code}): ${error.message}`,
        );
    }
  }

  static handlePrismaError(error: any): never {
    throw this.getHttpExceptionFromPrismaError(error);
  }
}
