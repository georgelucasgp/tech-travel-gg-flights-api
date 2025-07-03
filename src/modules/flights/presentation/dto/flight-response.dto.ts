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

  constructor(flight: Flight) {
    this.id = flight.id.getValue();
    this.flight_number = flight.flightNumber.getValue();
    this.airline_id = flight.airlineId;
    this.origin_iata = flight.originIata.getValue();
    this.destination_iata = flight.destinationIata.getValue();
    this.departure_datetime = flight.departureDatetime;
    this.arrival_datetime = flight.arrivalDatetime;
    this.frequency = flight.frequency.getValue();
    this.created_at = flight.createdAt;
    this.updated_at = flight.updatedAt;
    this.deleted_at = flight.deletedAt;
  }
}
