import { Itinerary } from '../entities/itinerary.entity';

export interface ItinerarySearchCriteria {
  origin: string;
  destination: string;
  date: Date;
  airline_codes?: string[];
  max_stops?: number;
}

export interface IItineraryRepository {
  create(itinerary: Itinerary): Promise<Itinerary>;
  findAll(): Promise<Itinerary[]>;
  findById(id: string): Promise<Itinerary | null>;
  findByCriteria(criteria: ItinerarySearchCriteria): Promise<Itinerary[]>;
  delete(id: string): Promise<void>;
}
