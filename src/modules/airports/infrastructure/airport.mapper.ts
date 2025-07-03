import { Airport as PrismaAirport } from 'generated/prisma/client';
import { Airport } from '../domain/entities/airport.entity';
import {
  AirportId,
  AirportName,
  AirportIataCode,
  AirportCity,
  AirportCountry,
  AirportTimezone,
} from '../domain/value-objects';

export class AirportMapper {
  static toDomain(prismaAirport: PrismaAirport): Airport {
    return Airport.create({
      id: AirportId.create(prismaAirport.id),
      name: new AirportName(prismaAirport.name),
      iataCode: new AirportIataCode(prismaAirport.iataCode),
      city: new AirportCity(prismaAirport.city || ''),
      country: new AirportCountry(prismaAirport.country || ''),
      timezone: new AirportTimezone(prismaAirport.timezone || ''),
      createdAt: prismaAirport.createdAt,
      updatedAt: prismaAirport.updatedAt,
      deletedAt: prismaAirport.deletedAt,
    });
  }

  static toPersistence(airport: Airport): PrismaAirport {
    return {
      id: airport.id.getValue(),
      name: airport.name.getValue(),
      iataCode: airport.iataCode.getValue(),
      city: airport.city.getValue(),
      country: airport.country.getValue(),
      timezone: airport.timezone.getValue(),
      createdAt: airport.createdAt,
      updatedAt: airport.updatedAt,
      deletedAt: airport.deletedAt,
    };
  }
}
