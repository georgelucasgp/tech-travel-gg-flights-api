import { Flight } from '../entities/flight.entity';
import { FlightQueryDto } from '../../presentation/dto/flight-query.dto';

export interface IFlightRepository {
  create(flight: Flight): Promise<Flight>;
  findAll(query?: FlightQueryDto): Promise<Flight[]>;
  findById(id: string): Promise<Flight | null>;
  findByFlightNumber(flightNumber: string): Promise<Flight | null>;
  update(flight: Flight): Promise<Flight>;
  delete(id: string): Promise<void>;
}
