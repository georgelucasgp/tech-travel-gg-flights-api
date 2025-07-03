import { Itinerary } from '../entities/itinerary.entity';

export interface IItineraryRepository {
  create(itinerary: Itinerary): Promise<Itinerary>;
  findAll(): Promise<Itinerary[]>;
  findById(id: string): Promise<Itinerary | null>;
  delete(id: string): Promise<void>;
}
