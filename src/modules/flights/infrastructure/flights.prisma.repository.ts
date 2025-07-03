import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { Flight } from '../domain/entities/flight.entity';
import { FlightMapper } from './flight.mapper';
import { FlightQueryDto } from '../presentation/dto/flight-query.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class FlightsPrismaRepository implements IFlightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(flight: Flight): Promise<Flight> {
    const persistenceData = FlightMapper.toPersistence(flight);

    const savedFlight = await this.prisma.flight.create({
      data: persistenceData,
    });

    return FlightMapper.toDomain(savedFlight);
  }

  async findAll(
    query?: FlightQueryDto,
    showDeleted = false,
  ): Promise<Flight[]> {
    const where: Prisma.FlightFindManyArgs['where'] = {
      ...(showDeleted ? {} : { deletedAt: null }),
      ...(query?.origin && { originIata: query.origin }),
      ...(query?.destination && { destinationIata: query.destination }),
      ...(query?.airlineCode && {
        airline: {
          iataCode: query.airlineCode,
          ...(showDeleted ? {} : { deletedAt: null }),
        },
      }),
    };
    const flights = await this.prisma.flight.findMany({
      where,
      include: {
        airline: true,
      },
    });
    return flights.map((flight) => FlightMapper.toDomain(flight));
  }

  async findById(id: string): Promise<Flight | null> {
    const flight = await this.prisma.flight.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return flight ? FlightMapper.toDomain(flight) : null;
  }

  async update(flight: Flight): Promise<Flight> {
    const persistenceData = FlightMapper.toPersistence(flight);

    const existingFlight = await this.prisma.flight.findFirst({
      where: {
        id: persistenceData.id,
        deletedAt: null,
      },
    });

    if (!existingFlight) {
      throw new NotFoundException('Flight not found');
    }

    const updatedFlight = await this.prisma.flight.update({
      where: { id: persistenceData.id },
      data: {
        ...persistenceData,
        updatedAt: new Date(),
      },
    });

    return FlightMapper.toDomain(updatedFlight);
  }

  async findByFlightNumber(flightNumber: string): Promise<Flight | null> {
    const flight = await this.prisma.flight.findFirst({
      where: { flightNumber, deletedAt: null },
    });

    return flight ? FlightMapper.toDomain(flight) : null;
  }

  async delete(id: string): Promise<void> {
    const existingFlight = await this.prisma.flight.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingFlight) {
      throw new NotFoundException('Flight not found');
    }

    await this.prisma.flight.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async recovery(id: string): Promise<Flight> {
    const recovered = await this.prisma.flight.update({
      where: { id },
      data: { deletedAt: null },
    });
    return FlightMapper.toDomain(recovered);
  }
}
