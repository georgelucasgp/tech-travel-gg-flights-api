import type { Airline as PrismaAirline } from '@prisma/client';
import { Airline } from '../domain/entities/airline.entity';
import {
  AirlineId,
  AirlineName,
  AirlineIataCode,
} from '../domain/value-objects';

export class AirlineMapper {
  static toDomain(prismaAirline: PrismaAirline): Airline {
    return Airline.create({
      id: new AirlineId(prismaAirline.id),
      name: new AirlineName(prismaAirline.name),
      iataCode: new AirlineIataCode(prismaAirline.iataCode),
      createdAt: prismaAirline.createdAt,
      updatedAt: prismaAirline.updatedAt,
      deletedAt: prismaAirline.deletedAt,
    });
  }

  static toPersistence(airline: Airline): PrismaAirline {
    return {
      id: airline.id.getValue(),
      name: airline.name.getValue(),
      iataCode: airline.iataCode.getValue(),
      createdAt: airline.createdAt,
      updatedAt: airline.updatedAt,
      deletedAt: airline.deletedAt,
    };
  }
}
