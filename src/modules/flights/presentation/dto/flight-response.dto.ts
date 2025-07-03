import { Flight } from '../../domain/entities/flight.entity';

export class FlightResponseDto {
  id: string;
  flight_number: string;
  airline_id: string;
  origin_iata: string;
  destination_iata: string;
  departure_datetime: Date;
  arrival_datetime: Date;
  frequency: number[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  static fromEntity(flight: Flight): FlightResponseDto {
    return {
      id: flight.id.getValue(),
      flight_number: flight.flightNumber.getValue(),
      airline_id: flight.airlineId,
      origin_iata: flight.originIata.getValue(),
      destination_iata: flight.destinationIata.getValue(),
      departure_datetime: flight.departureDatetime,
      arrival_datetime: flight.arrivalDatetime,
      frequency: flight.frequency.getValue(),
      created_at: flight.createdAt,
      updated_at: flight.updatedAt,
      deleted_at: flight.deletedAt,
    };
  }
}
