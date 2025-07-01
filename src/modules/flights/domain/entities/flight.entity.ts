import { randomUUID } from 'crypto';
import { IataCode, FlightNumber, Frequency, FlightId } from '../value-objects';
import { BadRequestException } from '@nestjs/common';

export interface FlightProps {
  id?: string;
  flightNumber: string;
  airlineId: string;
  originIata: string;
  destinationIata: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  frequency: number[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Flight {
  private constructor(
    private readonly _id: FlightId,
    private readonly _flightNumber: FlightNumber,
    private readonly _airlineId: string,
    private readonly _originIata: IataCode,
    private readonly _destinationIata: IataCode,
    private readonly _departureDatetime: Date,
    private readonly _arrivalDatetime: Date,
    private readonly _frequency: Frequency,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _deletedAt: Date | null,
  ) {}

  static create(props: FlightProps): Flight {
    if (props.arrivalDatetime <= props.departureDatetime) {
      throw new BadRequestException(
        'Arrival datetime must be after departure datetime',
      );
    }

    const flightId = props.id
      ? new FlightId(props.id)
      : new FlightId(randomUUID());

    return new Flight(
      flightId,
      new FlightNumber(props.flightNumber),
      props.airlineId,
      new IataCode(props.originIata),
      new IataCode(props.destinationIata),
      props.departureDatetime,
      props.arrivalDatetime,
      new Frequency(props.frequency),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
      props.deletedAt ?? null,
    );
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
