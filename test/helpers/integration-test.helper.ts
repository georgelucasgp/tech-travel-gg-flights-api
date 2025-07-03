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
      throw new Error('DATABASE_URL not found. Make sure .env.test is loaded.');
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
      id: '8f9c69a7-8f9f-4b4e-8d8b-2e9a2b3c1b2a',
      name: 'Aeroporto de Imperatriz',
      iataCode: 'IMP',
      city: 'Imperatriz',
      country: 'Brasil',
    });

    await this.createAirport({
      id: '9g8d7f6e-5c4b-3a2b-1d0c-9f8e7d6c5b4a',
      name: 'Aeroporto de Brasília',
      iataCode: 'BSB',
      city: 'Brasília',
      country: 'Brasil',
    });

    await this.createAirport({
      id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Aeroporto de Congonhas',
      iataCode: 'CGH',
      city: 'São Paulo',
      country: 'Brasil',
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
    ]);
  }

  async teardown(): Promise<void> {
    await this.cleanup();
    await this.prisma.$disconnect();
  }

  static reset(): void {
    globalSeedDataCreated = false;
    IntegrationTestHelper.instance = null;
  }
}
