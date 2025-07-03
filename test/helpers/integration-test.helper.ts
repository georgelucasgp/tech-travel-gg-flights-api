import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { execSync } from 'child_process';

let globalSeedDataCreated = false;

export class IntegrationTestHelper {
  private static instance: IntegrationTestHelper | null = null;

  constructor(private readonly prisma: PrismaService) {}

  static getInstance(prisma: PrismaService): IntegrationTestHelper {
    if (!IntegrationTestHelper.instance) {
      IntegrationTestHelper.instance = new IntegrationTestHelper(prisma);
    }
    return IntegrationTestHelper.instance;
  }

  async setup(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      throw new BadRequestException(
        'DATABASE_URL not found. Make sure .env.test is loaded.',
      );
    }

    if (!globalSeedDataCreated) {
      execSync(
        'npx prisma migrate reset --force --skip-seed --schema=prisma/schema.prisma',
        {
          stdio: 'inherit',
          env: process.env,
        },
      );
      await this.prisma.$connect();
      await this.createSeedData();
      globalSeedDataCreated = true;
    } else {
      await this.prisma.$connect();
    }
  }

  private async createSeedData(): Promise<void> {
    await this.createAirport({
      id: 'd7a8b1c2-e9f0-4a3b-b2a7-5c9e1f8a9d2f',
      name: 'Aeroporto de Imperatriz',
      iataCode: 'IMP',
      city: 'Imperatriz',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    });

    await this.createAirport({
      id: 'f4c9a6b1-83d2-4e09-9ba7-2e1b5c7a9d30',
      name: 'Aeroporto de Brasília',
      iataCode: 'BSB',
      city: 'Brasília',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    });

    await this.createAirport({
      id: 'a5b3f9e2-1764-4b38-a1c2-b6ef9d8a7f53',
      name: 'Aeroporto de Congonhas',
      iataCode: 'CGH',
      city: 'São Paulo',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    });

    await this.createAirline({
      id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
      name: 'LATAM Airlines',
      iataCode: 'LA',
    });
  }

  private async createAirport(airportData: any): Promise<void> {
    const existing = await this.prisma.airport.findUnique({
      where: { iataCode: airportData.iataCode },
    });

    if (!existing) {
      await this.prisma.airport.create({
        data: airportData,
      });
    }
  }

  private async createAirline(airlineData: any): Promise<void> {
    const existing = await this.prisma.airline.findUnique({
      where: { iataCode: airlineData.iataCode },
    });

    if (!existing) {
      await this.prisma.airline.create({
        data: airlineData,
      });
    }
  }

  async cleanup(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.booking.deleteMany(),
      this.prisma.itineraryFlight.deleteMany(),
      this.prisma.itinerary.deleteMany(),
      this.prisma.flight.deleteMany(),
      this.prisma.user.deleteMany(),
    ]);
  }

  async cleanupAll(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.booking.deleteMany(),
      this.prisma.itineraryFlight.deleteMany(),
      this.prisma.itinerary.deleteMany(),
      this.prisma.flight.deleteMany(),
      this.prisma.user.deleteMany(),
      this.prisma.airline.deleteMany(),
      this.prisma.airport.deleteMany(),
    ]);
  }

  async teardown(): Promise<void> {
    await this.cleanupAll();
    await this.prisma.$disconnect();
  }

  static reset(): void {
    globalSeedDataCreated = false;
    IntegrationTestHelper.instance = null;
  }
}
