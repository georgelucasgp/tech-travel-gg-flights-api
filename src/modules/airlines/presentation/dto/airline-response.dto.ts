import { Airline } from '../../domain/entities/airline.entity';

export class AirlineResponseDto {
  id: string;
  name: string;
  iata_code: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  constructor(airline: Airline) {
    this.id = airline.id.getValue();
    this.name = airline.name.getValue();
    this.iata_code = airline.iataCode.getValue();
    this.created_at = airline.createdAt;
    this.updated_at = airline.updatedAt;
    this.deleted_at = airline.deletedAt;
  }
}
