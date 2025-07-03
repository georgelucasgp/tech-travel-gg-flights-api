import { Airline } from '../../domain/entities/airline.entity';

export class AirlineResponseDto {
  id: string;
  name: string;
  iata_code: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  static fromEntity(airline: Airline): AirlineResponseDto {
    return {
      id: airline.id.getValue(),
      name: airline.name.getValue(),
      iata_code: airline.iataCode.getValue(),
      created_at: airline.createdAt,
      updated_at: airline.updatedAt,
      deleted_at: airline.deletedAt,
    };
  }
}
