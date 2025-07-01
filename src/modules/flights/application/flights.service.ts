import { Inject, Injectable } from '@nestjs/common';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { Flight } from '../domain/entities/flight.entity';
import { FlightQueryDto } from '../presentation/dto/flight-query.dto';

@Injectable()
export class FlightsService {
  constructor(
    @Inject('IFlightRepository')
    private readonly flightRepository: IFlightRepository,
  ) {}

  async create(createDto: CreateFlightDto): Promise<Flight> {
    const flight = Flight.create(createDto);
    return await this.flightRepository.create(flight);
  }

  findAll(query: FlightQueryDto): Promise<Flight[]> {
    return this.flightRepository.findAll(query);
  }

  async findById(id: string): Promise<Flight | null> {
    return await this.flightRepository.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.flightRepository.delete(id);
  }
}
