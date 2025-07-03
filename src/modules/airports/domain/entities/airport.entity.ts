import {
  AirportId,
  AirportName,
  AirportIataCode,
  AirportCity,
  AirportCountry,
  AirportTimezone,
} from '../value-objects';

export interface AirportProps {
  id: AirportId;
  name: AirportName;
  iataCode: AirportIataCode;
  city: AirportCity;
  country: AirportCountry;
  timezone: AirportTimezone;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Airport {
  private constructor(
    private readonly _id: AirportId,
    private _name: AirportName,
    private _iataCode: AirportIataCode,
    private _city: AirportCity,
    private _country: AirportCountry,
    private _timezone: AirportTimezone,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null,
  ) {}

  static create(props: AirportProps): Airport {
    return new Airport(
      props.id,
      props.name,
      props.iataCode,
      props.city,
      props.country,
      props.timezone,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  get id(): AirportId {
    return this._id;
  }

  get name(): AirportName {
    return this._name;
  }

  get iataCode(): AirportIataCode {
    return this._iataCode;
  }

  get city(): AirportCity {
    return this._city;
  }

  get country(): AirportCountry {
    return this._country;
  }

  get timezone(): AirportTimezone {
    return this._timezone;
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

  changeName(newName: AirportName): void {
    this._name = newName;
    this.updateTimestamp();
  }

  changeIataCode(newIataCode: AirportIataCode): void {
    this._iataCode = newIataCode;
    this.updateTimestamp();
  }

  changeCity(newCity: AirportCity): void {
    this._city = newCity;
    this.updateTimestamp();
  }

  changeCountry(newCountry: AirportCountry): void {
    this._country = newCountry;
    this.updateTimestamp();
  }

  changeTimezone(newTimezone: AirportTimezone): void {
    this._timezone = newTimezone;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  equals(other: Airport): boolean {
    return this._id.equals(other._id);
  }

  toString(): string {
    return `Airport(${this._id.getValue()}, ${this._name.getValue()}, ${this._iataCode.getValue()})`;
  }
}
