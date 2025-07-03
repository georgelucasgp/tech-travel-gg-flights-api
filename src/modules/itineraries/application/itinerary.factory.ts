import { Itinerary } from '../domain/entities/itinerary.entity';
import { ItineraryId } from '../domain/value-objects';
import { Flight } from '../../flights/domain/entities/flight.entity';
import { randomUUID } from 'crypto';

export type ItineraryFactoryProps = {
  id?: string;
  flights: Flight[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export class ItineraryFactory {
  static create(props: ItineraryFactoryProps): Itinerary {
    return Itinerary.create({
      id: ItineraryId.create(props.id ?? randomUUID()),
      flights: props.flights,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
