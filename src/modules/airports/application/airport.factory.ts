import { Airport } from '../domain/entities/airport.entity';
import {
  AirportId,
  AirportName,
  AirportIataCode,
  AirportCity,
  AirportCountry,
  AirportTimezone,
} from '../domain/value-objects';

export type AirportFactoryProps = {
  id?: string;
  name: string;
  iataCode: string;
  city: string;
  country: string;
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export class AirportFactory {
  static create(props: AirportFactoryProps): Airport {
    return Airport.create({
      id: props.id ? AirportId.create(props.id) : AirportId.create(),
      name: new AirportName(props.name),
      iataCode: new AirportIataCode(props.iataCode),
      city: new AirportCity(props.city),
      country: new AirportCountry(props.country),
      timezone: new AirportTimezone(props.timezone),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
