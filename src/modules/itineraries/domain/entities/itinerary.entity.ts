import { BadRequestException } from '@nestjs/common';
import { Flight } from '../../../flights/domain/entities/flight.entity';
import { ItineraryId } from '../value-objects';

export interface ItineraryProps {
  id: ItineraryId;
  flights: Flight[];
  createdAt: Date;
  updatedAt: Date;
}

export class Itinerary {
  private constructor(
    private readonly _id: ItineraryId,
    private readonly _flights: Flight[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: ItineraryProps): Itinerary {
    this.validateFlightsSequence(props.flights);

    return new Itinerary(
      props.id,
      props.flights,
      props.createdAt,
      props.updatedAt,
    );
  }

  private static validateFlightsSequence(flights: Flight[]): void {
    if (!flights || flights.length === 0) {
      throw new BadRequestException('Itinerary must have at least one flight');
    }

    if (flights.length === 1) {
      return;
    }

    for (let i = 0; i < flights.length - 1; i++) {
      const currentFlight = flights[i];
      const nextFlight = flights[i + 1];

      this.validateRouteSequence(currentFlight, nextFlight);
      this.validateTemporalSequence(currentFlight, nextFlight);
      this.validateConnectionTime(currentFlight, nextFlight);
    }
  }

  private static validateRouteSequence(
    currentFlight: Flight,
    nextFlight: Flight,
  ): void {
    if (
      currentFlight.destinationIata.getValue() !==
      nextFlight.originIata.getValue()
    ) {
      throw new BadRequestException(
        `Invalid route sequence: Flight ${currentFlight.flightNumber.getValue()} destination (${currentFlight.destinationIata.getValue()}) must match next flight ${nextFlight.flightNumber.getValue()} origin (${nextFlight.originIata.getValue()})`,
      );
    }
  }

  private static validateTemporalSequence(
    currentFlight: Flight,
    nextFlight: Flight,
  ): void {
    if (nextFlight.departureDatetime <= currentFlight.arrivalDatetime) {
      throw new BadRequestException(
        `Invalid temporal sequence: Next flight ${nextFlight.flightNumber.getValue()} departure (${nextFlight.departureDatetime.toISOString()}) must be after current flight ${currentFlight.flightNumber.getValue()} arrival (${currentFlight.arrivalDatetime.toISOString()})`,
      );
    }
  }

  private static validateConnectionTime(
    currentFlight: Flight,
    nextFlight: Flight,
  ): void {
    const MINIMUM_CONNECTION_TIME_MINUTES = 45;
    const connectionTimeMs =
      nextFlight.departureDatetime.getTime() -
      currentFlight.arrivalDatetime.getTime();
    const connectionTimeMinutes = connectionTimeMs / (1000 * 60);

    if (connectionTimeMinutes < MINIMUM_CONNECTION_TIME_MINUTES) {
      throw new BadRequestException(
        `Insufficient connection time: ${connectionTimeMinutes.toFixed(1)} minutes between flight ${currentFlight.flightNumber.getValue()} and ${nextFlight.flightNumber.getValue()}. Minimum required: ${MINIMUM_CONNECTION_TIME_MINUTES} minutes`,
      );
    }
  }

  private updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  get id(): ItineraryId {
    return this._id;
  }

  get flights(): Flight[] {
    return [...this._flights];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get originIata(): string {
    return this._flights[0]?.originIata.getValue() || '';
  }

  get destinationIata(): string {
    return (
      this._flights[this._flights.length - 1]?.destinationIata.getValue() || ''
    );
  }

  get departureDateTime(): Date {
    return this._flights[0]?.departureDatetime || new Date();
  }

  get arrivalDateTime(): Date {
    return (
      this._flights[this._flights.length - 1]?.arrivalDatetime || new Date()
    );
  }

  get totalDurationMinutes(): number {
    if (this._flights.length === 0) return 0;

    const totalMs =
      this.arrivalDateTime.getTime() - this.departureDateTime.getTime();
    return Math.round(totalMs / (1000 * 60));
  }

  get stops(): number {
    return Math.max(0, this._flights.length - 1);
  }

  equals(other: Itinerary): boolean {
    return this._id.equals(other._id);
  }
}
