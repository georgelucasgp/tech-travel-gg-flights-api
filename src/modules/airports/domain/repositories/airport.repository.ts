import { Airport } from '../entities/airport.entity';

export interface IAirportRepository {
  create(airport: Airport): Promise<Airport>;
  findAll(): Promise<Airport[]>;
  findById(id: string): Promise<Airport | null>;
  findByIataCode(iataCode: string): Promise<Airport | null>;
  update(airport: Airport): Promise<Airport>;
  delete(id: string): Promise<void>;
}
