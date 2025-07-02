import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { UpdateFlightDto } from '../presentation/dto/update-flight.dto';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { Flight } from '../domain/entities/flight.entity';
import { FlightQueryDto } from '../presentation/dto/flight-query.dto';
import { FlightFactory } from './flight.factory';
import { FlightNumber, IataCode, Frequency } from '../domain/value-objects';

@Injectable()
export class FlightsService {
  constructor(
    @Inject('IFlightRepository')
    private readonly flightRepository: IFlightRepository,
  ) {}

  async create(createDto: CreateFlightDto): Promise<Flight> {
    const existingFlight = await this.flightRepository.findByFlightNumber(
      createDto.flightNumber,
    );
    if (existingFlight) {
      throw new BadRequestException('Flight already exists');
    }
    const flight = FlightFactory.create(createDto);
    return await this.flightRepository.create(flight);
  }

  async update(id: string, updateDto: UpdateFlightDto): Promise<Flight> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (updateDto.flightNumber) {
      flight.changeFlightNumber(new FlightNumber(updateDto.flightNumber));
    }

    if (updateDto.airlineId) {
      flight.changeAirline(updateDto.airlineId);
    }

    if (updateDto.originIata || updateDto.destinationIata) {
      const newOriginIata = updateDto.originIata
        ? new IataCode(updateDto.originIata)
        : flight.originIata;
      const newDestinationIata = updateDto.destinationIata
        ? new IataCode(updateDto.destinationIata)
        : flight.destinationIata;

      flight.changeRoute(newOriginIata, newDestinationIata);
    }

    if (updateDto.departureDatetime || updateDto.arrivalDatetime) {
      const newDepartureDatetime =
        updateDto.departureDatetime || flight.departureDatetime;
      const newArrivalDatetime =
        updateDto.arrivalDatetime || flight.arrivalDatetime;

      flight.changeSchedule(newDepartureDatetime, newArrivalDatetime);
    }

    if (updateDto.frequency) {
      flight.changeFrequency(new Frequency(updateDto.frequency));
    }

    return await this.flightRepository.update(flight);
  }

  findAll(query: FlightQueryDto): Promise<Flight[]> {
    return this.flightRepository.findAll(query);
  }

  async findById(id: string): Promise<Flight | null> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return flight;
  }

  async findByFlightNumber(flightNumber: string): Promise<Flight | null> {
    const flight = await this.flightRepository.findByFlightNumber(flightNumber);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return flight;
  }

  async delete(id: string): Promise<void> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    await this.flightRepository.delete(id);
  }
}
