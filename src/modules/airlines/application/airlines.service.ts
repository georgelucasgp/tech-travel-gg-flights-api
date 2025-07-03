import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { IAirlineRepository } from '../domain/repositories/airline.repository';
import { Airline } from '../domain/entities/airline.entity';
import { AirlineName, AirlineIataCode } from '../domain/value-objects';
import { AirlineFactory } from './airline.factory';
import { CreateAirlineDto } from '../presentation/dto/create-airline.dto';
import { UpdateAirlineDto } from '../presentation/dto/update-airline.dto';

@Injectable()
export class AirlinesService {
  constructor(
    @Inject('IAirlineRepository')
    private readonly airlineRepository: IAirlineRepository,
  ) {}

  async create(createAirlineDto: CreateAirlineDto): Promise<Airline> {
    const existingAirline = await this.airlineRepository.findByIataCode(
      createAirlineDto.iata_code,
    );

    if (existingAirline) {
      throw new ConflictException(
        `Airline with IATA code ${createAirlineDto.iata_code} already exists`,
      );
    }

    const airline = AirlineFactory.create(createAirlineDto);
    return await this.airlineRepository.create(airline);
  }

  async findAll(): Promise<Airline[]> {
    return await this.airlineRepository.findAll();
  }

  async findOne(id: string): Promise<Airline> {
    const airline = await this.airlineRepository.findById(id);

    if (!airline) {
      throw new NotFoundException(`Airline with ID ${id} not found`);
    }

    return airline;
  }

  async update(
    id: string,
    updateAirlineDto: UpdateAirlineDto,
  ): Promise<Airline> {
    const airline = await this.findOne(id);

    if (updateAirlineDto.iata_code) {
      const existingAirline = await this.airlineRepository.findByIataCode(
        updateAirlineDto.iata_code,
      );

      if (existingAirline && !existingAirline.id.equals(airline.id)) {
        throw new ConflictException(
          `Another airline with IATA code ${updateAirlineDto.iata_code} already exists`,
        );
      }
    }

    const updatedAirline = Airline.create({
      id: airline.id,
      name: updateAirlineDto.name
        ? new AirlineName(updateAirlineDto.name)
        : airline.name,
      iataCode: updateAirlineDto.iata_code
        ? new AirlineIataCode(updateAirlineDto.iata_code)
        : airline.iataCode,
      createdAt: airline.createdAt,
      updatedAt: new Date(),
      deletedAt: airline.deletedAt,
    });

    return await this.airlineRepository.update(updatedAirline);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.airlineRepository.delete(id);
  }
}
