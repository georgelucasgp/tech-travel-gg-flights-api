import { Airline } from '../entities/airline.entity';

export interface IAirlineRepository {
  create(airline: Airline): Promise<Airline>;
  findAll(showDeleted?: boolean): Promise<Airline[]>;
  findById(id: string): Promise<Airline | null>;
  findByIataCode(iataCode: string): Promise<Airline | null>;
  update(airline: Airline): Promise<Airline>;
  delete(id: string): Promise<void>;
  recovery(id: string): Promise<Airline>;
}
