import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { UpdateFlightDto } from '../presentation/dto/update-flight.dto';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { Flight } from '../domain/entities/flight.entity';
import { FlightQueryDto } from '../presentation/dto/flight-query.dto';
import { FlightFactory } from './flight.factory';
import { FlightNumber, IataCode, Frequency } from '../domain/value-objects';
import { AirportsService } from '../../airports/application/airports.service';
import { AirlinesService } from '../../airlines/application/airlines.service';

@Injectable()
export class FlightsService {
  constructor(
    @Inject('IFlightRepository')
    private readonly flightRepository: IFlightRepository,
    private readonly airportsService: AirportsService,
    private readonly airlinesService: AirlinesService,
  ) {}

  async create(createDto: CreateFlightDto): Promise<Flight> {
    await this.ensureAirlineExists(createDto.airline_id);
    await this.ensureOriginAirportExists(createDto.origin_iata);
    await this.ensureDestinationAirportExists(createDto.destination_iata);

    const existingFlight = await this.flightRepository.findByFlightNumber(
      createDto.flight_number,
    );
    if (existingFlight) {
      throw new BadRequestException(
        `Flight ${createDto.flight_number} already exists`,
      );
    }

    const flight = FlightFactory.create({
      flight_number: createDto.flight_number,
      airline_id: createDto.airline_id,
      origin_iata: createDto.origin_iata,
      destination_iata: createDto.destination_iata,
      departure_datetime: createDto.departure_datetime,
      arrival_datetime: createDto.arrival_datetime,
      frequency: createDto.frequency,
    });
    return await this.flightRepository.create(flight);
  }

  async update(id: string, updateDto: UpdateFlightDto): Promise<Flight> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (updateDto.airline_id) {
      await this.ensureAirlineExists(updateDto.airline_id);
      flight.changeAirline(updateDto.airline_id);
    }

    if (updateDto.origin_iata) {
      await this.ensureOriginAirportExists(updateDto.origin_iata);
    }
    if (updateDto.destination_iata) {
      await this.ensureDestinationAirportExists(updateDto.destination_iata);
    }

    if (updateDto.flight_number) {
      const existingFlight = await this.flightRepository.findByFlightNumber(
        updateDto.flight_number,
      );
      if (
        existingFlight &&
        existingFlight.id.getValue() !== flight.id.getValue()
      ) {
        throw new BadRequestException(
          `Flight ${updateDto.flight_number} already exists`,
        );
      }
      flight.changeFlightNumber(new FlightNumber(updateDto.flight_number));
    }

    if (updateDto.origin_iata || updateDto.destination_iata) {
      const newOriginIata = updateDto.origin_iata
        ? new IataCode(updateDto.origin_iata)
        : flight.originIata;
      const newDestinationIata = updateDto.destination_iata
        ? new IataCode(updateDto.destination_iata)
        : flight.destinationIata;

      flight.changeRoute(newOriginIata, newDestinationIata);
    }

    if (updateDto.departure_datetime || updateDto.arrival_datetime) {
      const newDepartureDatetime =
        updateDto.departure_datetime || flight.departureDatetime;
      const newArrivalDatetime =
        updateDto.arrival_datetime || flight.arrivalDatetime;

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

    if (flight.deletedAt) {
      throw new ConflictException(`Flight with ID ${id} is already deleted`);
    }

    await this.flightRepository.delete(id);
  }

  async recovery(id: string): Promise<Flight> {
    const existingFlight = await this.flightRepository.findById(id);
    if (!existingFlight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }
    if (!existingFlight.deletedAt) {
      throw new ConflictException(`Flight with ID ${id} is already active`);
    }
    return await this.flightRepository.recovery(id);
  }

  private async ensureOriginAirportExists(iata: string) {
    const airport = await this.airportsService.findByIataCode(iata);
    if (!airport) {
      throw new BadRequestException(`Origin airport (${iata}) does not exist.`);
    }
  }

  private async ensureDestinationAirportExists(iata: string) {
    const airport = await this.airportsService.findByIataCode(iata);
    if (!airport) {
      throw new BadRequestException(
        `Destination airport (${iata}) does not exist.`,
      );
    }
  }

  private async ensureAirlineExists(airlineId: string) {
    try {
      await this.airlinesService.findById(airlineId);
    } catch {
      throw new BadRequestException(`Airline (${airlineId}) does not exist.`);
    }
  }
}
