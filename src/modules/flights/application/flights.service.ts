import { Inject, Injectable } from '@nestjs/common';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { Flight } from '../domain/entities/flight.entity';

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

  async findAll(): Promise<Flight[]> {
    return await this.flightRepository.findAll();
  }

  async findById(id: string): Promise<Flight | null> {
    return await this.flightRepository.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.flightRepository.delete(id);
  }
}
