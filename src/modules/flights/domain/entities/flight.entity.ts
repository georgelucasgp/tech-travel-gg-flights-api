import { IataCode, FlightNumber, Frequency, FlightId } from '../value-objects';
import { BadRequestException } from '@nestjs/common';

export interface FlightProps {
  id: FlightId;
  flightNumber: FlightNumber;
  airlineId: string;
  originIata: IataCode;
  destinationIata: IataCode;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: Frequency;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Flight {
  private constructor(
    private readonly _id: FlightId,
    private _flightNumber: FlightNumber,
    private _airlineId: string,
    private _originIata: IataCode,
    private _destinationIata: IataCode,
    private _departureDatetime: Date,
    private _arrivalDatetime: Date,
    private _frequency: Frequency,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null,
  ) {}

  static create(props: FlightProps): Flight {
    if (props.arrivalDatetime <= props.departureDatetime) {
      throw new BadRequestException(
        'Arrival datetime must be after departure datetime',
      );
    }

    if (props.originIata.equals(props.destinationIata)) {
      throw new BadRequestException(
        'Origin and destination cannot be the same',
      );
    }

    return new Flight(
      props.id,
      props.flightNumber,
      props.airlineId,
      props.originIata,
      props.destinationIata,
      props.departureDatetime,
      props.arrivalDatetime,
      props.frequency,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  static fromPersistence(props: FlightProps): Flight {
    return new Flight(
      props.id,
      props.flightNumber,
      props.airlineId,
      props.originIata,
      props.destinationIata,
      props.departureDatetime,
      props.arrivalDatetime,
      props.frequency,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  changeFlightNumber(newFlightNumber: FlightNumber): void {
    this._flightNumber = newFlightNumber;
    this.updateTimestamp();
  }

  changeAirline(newAirlineId: string): void {
    if (!newAirlineId || newAirlineId.trim() === '') {
      throw new BadRequestException('Airline ID cannot be empty');
    }
    this._airlineId = newAirlineId;
    this.updateTimestamp();
  }

  changeRoute(newOriginIata: IataCode, newDestinationIata: IataCode): void {
    if (newOriginIata.equals(newDestinationIata)) {
      throw new BadRequestException(
        'Origin and destination cannot be the same',
      );
    }
    this._originIata = newOriginIata;
    this._destinationIata = newDestinationIata;
    this.updateTimestamp();
  }

  changeSchedule(newDepartureDatetime: Date, newArrivalDatetime: Date): void {
    if (newArrivalDatetime <= newDepartureDatetime) {
      throw new BadRequestException(
        'Arrival datetime must be after departure datetime',
      );
    }
    this._departureDatetime = newDepartureDatetime;
    this._arrivalDatetime = newArrivalDatetime;
    this.updateTimestamp();
  }

  changeFrequency(newFrequency: Frequency): void {
    this._frequency = newFrequency;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  get id(): FlightId {
    return this._id;
  }

  get flightNumber(): FlightNumber {
    return this._flightNumber;
  }

  get airlineId(): string {
    return this._airlineId;
  }

  get originIata(): IataCode {
    return this._originIata;
  }

  get destinationIata(): IataCode {
    return this._destinationIata;
  }

  get departureDatetime(): Date {
    return this._departureDatetime;
  }

  get arrivalDatetime(): Date {
    return this._arrivalDatetime;
  }

  get frequency(): Frequency {
    return this._frequency;
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

  equals(other: Flight): boolean {
    return this._id.equals(other._id);
  }
}
