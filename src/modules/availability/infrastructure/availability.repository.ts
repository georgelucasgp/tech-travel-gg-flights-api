import { Inject, Injectable } from '@nestjs/common';
import {
  IAvailabilityRepository,
  FlightSearchCriteria,
} from '../domain/repositories/availability.repository';
import { Flight } from '../../flights/domain/entities/flight.entity';
import { IFlightRepository } from '../../flights/domain/repositories/flight.repository';

@Injectable()
export class AvailabilityRepository implements IAvailabilityRepository {
  private readonly MIN_CONNECTION_TIME_MINUTES = 45;

  constructor(
    @Inject('IFlightRepository')
    private readonly flightRepository: IFlightRepository,
  ) {}

  async findAvailableFlights(
    criteria: FlightSearchCriteria,
  ): Promise<Flight[]> {
    const allFlights = await this.flightRepository.findAll({
      origin: criteria.origin,
      destination: criteria.destination,
      airline_code: criteria.airline_codes?.[0],
    });

    return allFlights.filter((flight) => {
      const operatesOnDate = this.isFlightOperatingOnDate(
        flight,
        criteria.date,
      );

      if (!operatesOnDate) return false;
      if (!criteria.airline_codes || criteria.airline_codes.length === 0) {
        return true;
      }

      return criteria.airline_codes.some(() => flight.airlineId);
    });
  }

  isFlightOperatingOnDate(flight: Flight, date: Date): boolean {
    const dayOfWeek = date.getDay();
    return flight.frequency.getValue().includes(dayOfWeek);
  }

  hasValidConnectionTime(
    firstFlight: Flight,
    secondFlight: Flight,
    minConnectionMinutes: number = this.MIN_CONNECTION_TIME_MINUTES,
  ): boolean {
    const connectionTimeMs =
      secondFlight.departureDatetime.getTime() -
      firstFlight.arrivalDatetime.getTime();

    const connectionTimeMinutes = connectionTimeMs / (1000 * 60);

    return connectionTimeMinutes >= minConnectionMinutes;
  }
}
