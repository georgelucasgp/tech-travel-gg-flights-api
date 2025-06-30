import { Flight } from '../entities/flight.entity';

export interface IFlightRepository {
  create(flight: Flight): Promise<Flight>;
  findAll(): Promise<Flight[]>;
  findById(id: string): Promise<Flight | null>;
  delete(id: string): Promise<void>;
}
