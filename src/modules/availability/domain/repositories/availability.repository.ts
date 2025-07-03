import { Flight } from '../../../flights/domain/entities/flight.entity';

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  date: Date;
  airline_codes?: string[];
}

export interface IAvailabilityRepository {
  findAvailableFlights(criteria: FlightSearchCriteria): Promise<Flight[]>;

  isFlightOperatingOnDate(flight: Flight, date: Date): boolean;

  hasValidConnectionTime(
    firstFlight: Flight,
    secondFlight: Flight,
    minConnectionMinutes?: number,
  ): boolean;
}
