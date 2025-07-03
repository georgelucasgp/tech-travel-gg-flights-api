import {
  BadRequestException,
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
      createDto.iataCode,
    );
    if (existingAirport) {
      throw new BadRequestException('Airport already exists');
    }
    const airport = AirportFactory.create(createDto);
    return await this.airportRepository.create(airport);
  }

  async findAll(): Promise<Airport[]> {
    return await this.airportRepository.findAll();
  }

  async findById(id: string): Promise<Airport> {
    const airport = await this.airportRepository.findById(id);
    if (!airport) {
      throw new NotFoundException(`Airport with ID ${id} not found`);
    }
    return airport;
  }

  async update(id: string, updateDto: UpdateAirportDto): Promise<Airport> {
    const existingAirport = await this.findById(id);

    if (
      updateDto.iataCode &&
      updateDto.iataCode !== existingAirport.iataCode.getValue()
    ) {
      const airportWithSameIata = await this.airportRepository.findByIataCode(
        updateDto.iataCode,
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
      iataCode: updateDto.iataCode || existingAirport.iataCode.getValue(),
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
}
