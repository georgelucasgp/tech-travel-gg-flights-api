import { Flight } from '../../domain/entities/flight.entity';

export class FlightResponseDto {
  id: string;
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(flight: Flight) {
    this.id = flight.id.getValue();
    this.flightNumber = flight.flightNumber.getValue();
    this.airlineId = flight.airlineId;
    this.originIata = flight.originIata.getValue();
    this.destinationIata = flight.destinationIata.getValue();
    this.departureDatetime = flight.departureDatetime;
    this.arrivalDatetime = flight.arrivalDatetime;
    this.frequency = flight.frequency.getValue();
    this.createdAt = flight.createdAt;
    this.updatedAt = flight.updatedAt;
    this.deletedAt = flight.deletedAt;
  }
}
