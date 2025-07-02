import { Flight } from '../../../flights/domain/entities/flight.entity';
import { ItineraryId } from '../value-objects';

export interface ItineraryProps {
  id?: ItineraryId;
  flights: Flight[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Itinerary {
  private readonly _id: ItineraryId;
  private readonly _flights: Flight[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  private constructor(props: ItineraryProps) {
    this._id = props.id || ItineraryId.create();
    this._flights = props.flights;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._deletedAt = props.deletedAt || null;
  }

  static create(flights: Flight[]): Itinerary {
    this.validateFlightsSequence(flights);
    return new Itinerary({ flights });
  }

  private static validateFlightsSequence(flights: Flight[]): void {
    if (!flights || flights.length === 0) {
      throw new Error('Itinerary must have at least one flight');
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
      throw new Error(
        `Invalid route sequence: Flight ${currentFlight.flightNumber.getValue()} destination (${currentFlight.destinationIata.getValue()}) must match next flight ${nextFlight.flightNumber.getValue()} origin (${nextFlight.originIata.getValue()})`,
      );
    }
  }

  private static validateTemporalSequence(
    currentFlight: Flight,
    nextFlight: Flight,
  ): void {
    if (nextFlight.departureDatetime <= currentFlight.arrivalDatetime) {
      throw new Error(
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
      throw new Error(
        `Insufficient connection time: ${connectionTimeMinutes.toFixed(1)} minutes between flight ${currentFlight.flightNumber.getValue()} and ${nextFlight.flightNumber.getValue()}. Minimum required: ${MINIMUM_CONNECTION_TIME_MINUTES} minutes`,
      );
    }
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

  get deletedAt(): Date | null {
    return this._deletedAt;
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

  markAsDeleted(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }
}
