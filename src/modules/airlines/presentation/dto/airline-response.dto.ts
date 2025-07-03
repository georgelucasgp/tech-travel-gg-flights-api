import { Airline } from '../../domain/entities/airline.entity';

export class AirlineResponseDto {
  id: string;
  name: string;
  iataCode: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(airline: Airline) {
    this.id = airline.id.getValue();
    this.name = airline.name.getValue();
    this.iataCode = airline.iataCode.getValue();
    this.createdAt = airline.createdAt;
    this.updatedAt = airline.updatedAt;
    this.deletedAt = airline.deletedAt;
  }
}
