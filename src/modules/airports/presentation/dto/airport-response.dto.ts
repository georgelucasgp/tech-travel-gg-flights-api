import { Airport } from '../../domain/entities/airport.entity';

export class AirportResponseDto {
  id: string;
  name: string;
  iataCode: string;
  city: string;
  country: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(airport: Airport) {
    this.id = airport.id.getValue();
    this.name = airport.name.getValue();
    this.iataCode = airport.iataCode.getValue();
    this.city = airport.city.getValue();
    this.country = airport.country.getValue();
    this.timezone = airport.timezone.getValue();
    this.createdAt = airport.createdAt;
    this.updatedAt = airport.updatedAt;
    this.deletedAt = airport.deletedAt;
  }
}
