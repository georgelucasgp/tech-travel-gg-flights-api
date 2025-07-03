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

  constructor(airport: Airport) {
    this.id = airport.id.getValue();
    this.name = airport.name.getValue();
    this.iata_code = airport.iataCode.getValue();
    this.city = airport.city.getValue();
    this.country = airport.country.getValue();
    this.timezone = airport.timezone.getValue();
    this.created_at = airport.createdAt;
    this.updated_at = airport.updatedAt;
    this.deleted_at = airport.deletedAt;
  }
}
