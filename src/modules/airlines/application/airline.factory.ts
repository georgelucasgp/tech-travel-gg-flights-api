import { Injectable } from '@nestjs/common';
import { Airline } from '../domain/entities/airline.entity';
import {
  AirlineId,
  AirlineName,
  AirlineIataCode,
} from '../domain/value-objects';

export type AirlineFactoryProps = {
  id?: string;
  name: string;
  iataCode: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Injectable()
export class AirlineFactory {
  static create(props: AirlineFactoryProps): Airline {
    return Airline.create({
      id: props.id ? new AirlineId(props.id) : AirlineId.create(),
      name: new AirlineName(props.name),
      iataCode: new AirlineIataCode(props.iataCode),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
