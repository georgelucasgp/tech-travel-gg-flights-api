import { Flight } from './flight.entity';

export interface IFlightRepository {
  create(flight: Flight): Promise<Flight>;
  findAll(): Promise<Flight[]>;
  findById(id: string): Promise<Flight | null>;
  update(flight: Flight): Promise<Flight>;
  delete(id: string): Promise<void>;
}
