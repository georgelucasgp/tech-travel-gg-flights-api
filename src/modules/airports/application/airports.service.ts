import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAirportDto } from '../presentation/dto/create-airport.dto';
import { UpdateAirportDto } from '../presentation/dto/update-airport.dto';
import { IAirportRepository } from '../domain/repositories/airport.repository';
import { Airport } from '../domain/entities/airport.entity';
import { AirportFactory } from './airport.factory';

@Injectable()
export class AirportsService {
  constructor(
    @Inject('IAirportRepository')
    private readonly airportRepository: IAirportRepository,
  ) {}

  async create(createDto: CreateAirportDto): Promise<Airport> {
    const existingAirport = await this.airportRepository.findByIataCode(
      createDto.iata_code,
    );
    if (existingAirport) {
      if (existingAirport.deletedAt) {
        throw new ConflictException(
          `Airport with IATA code ${createDto.iata_code} is inactive. Use recovery endpoint to reactivate it.`,
        );
      }
      throw new ConflictException(
        `Airport with IATA code ${createDto.iata_code} already exists`,
      );
    }
    const airport = AirportFactory.create(createDto);
    return await this.airportRepository.create(airport);
  }

  async findAll(showDeleted = false): Promise<Airport[]> {
    return await this.airportRepository.findAll(showDeleted);
  }

  async findById(id: string): Promise<Airport> {
    const airport = await this.airportRepository.findById(id);
    if (!airport) {
      throw new NotFoundException(`Airport with ID ${id} not found`);
    }
    return airport;
  }

  async findByIataCode(iataCode: string): Promise<Airport> {
    const airport = await this.airportRepository.findByIataCode(iataCode);
    if (!airport) {
      throw new NotFoundException(
        `Airport with IATA code ${iataCode} not found`,
      );
    }
    return airport;
  }

  async update(id: string, updateDto: UpdateAirportDto): Promise<Airport> {
    const existingAirport = await this.findById(id);

    if (updateDto.iata_code && existingAirport.deletedAt) {
      throw new ConflictException(
        `Airport with IATA code ${updateDto.iata_code} is inactive. Use recovery endpoint to reactivate it.`,
      );
    }

    if (
      updateDto.iata_code &&
      updateDto.iata_code !== existingAirport.iataCode.getValue()
    ) {
      const airportWithSameIata = await this.airportRepository.findByIataCode(
        updateDto.iata_code,
      );
      if (airportWithSameIata) {
        throw new BadRequestException(
          'Another airport with this IATA code already exists',
        );
      }
    }

    const updatedAirport = AirportFactory.create({
      id: existingAirport.id.getValue(),
      name: updateDto.name || existingAirport.name.getValue(),
      iata_code: updateDto.iata_code || existingAirport.iataCode.getValue(),
      city: updateDto.city || existingAirport.city.getValue(),
      country: updateDto.country || existingAirport.country.getValue(),
      timezone: updateDto.timezone || existingAirport.timezone.getValue(),
      createdAt: existingAirport.createdAt,
      updatedAt: new Date(),
      deletedAt: existingAirport.deletedAt,
    });

    return await this.airportRepository.update(updatedAirport);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.airportRepository.delete(id);
  }

  async recovery(id: string): Promise<Airport> {
    const existingAirport = await this.airportRepository.findById(id);
    if (!existingAirport) {
      throw new NotFoundException(`Airport with ID ${id} not found`);
    }
    if (!existingAirport.deletedAt) {
      throw new ConflictException(`Airport with ID ${id} is already active`);
    }
    return await this.airportRepository.recovery(id);
  }
}
