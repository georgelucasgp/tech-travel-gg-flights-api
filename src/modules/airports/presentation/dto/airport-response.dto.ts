import { Airport } from '../../domain/entities/airport.entity';

export class AirportResponseDto {
  id: string;
  name: string;
  iata_code: string;
  city: string;
  country: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  static fromEntity(airport: Airport): AirportResponseDto {
    return {
      id: airport.id.getValue(),
      name: airport.name.getValue(),
      iata_code: airport.iataCode.getValue(),
      city: airport.city.getValue(),
      country: airport.country.getValue(),
      timezone: airport.timezone.getValue(),
      created_at: airport.createdAt,
      updated_at: airport.updatedAt,
      deleted_at: airport.deletedAt,
    };
  }
}
