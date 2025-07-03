import { AirlineId, AirlineName, AirlineIataCode } from '../value-objects';

export interface AirlineProps {
  id: AirlineId;
  name: AirlineName;
  iataCode: AirlineIataCode;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Airline {
  constructor(
    private readonly _id: AirlineId,
    private readonly _name: AirlineName,
    private readonly _iataCode: AirlineIataCode,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null,
  ) {}

  static create(props: AirlineProps): Airline {
    return new Airline(
      props.id,
      props.name,
      props.iataCode,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  get id(): AirlineId {
    return this._id;
  }

  get name(): AirlineName {
    return this._name;
  }

  get iataCode(): AirlineIataCode {
    return this._iataCode;
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

  update(): void {
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }
}
