import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Itinerary } from '../domain/entities/itinerary.entity';
import { ItinerariesPrismaRepository } from './itineraries.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import {
  FlightFactory,
  FlightFactoryProps,
} from '../../flights/application/flight.factory';
import {
  ItineraryFactory,
  ItineraryFactoryProps,
} from '../application/itinerary.factory';
import { NotFoundException } from '@nestjs/common';

describe('ItinerariesPrismaRepository (Integration)', () => {
  let repository: ItinerariesPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItinerariesPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<ItinerariesPrismaRepository>(
      ItinerariesPrismaRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);

    await helper.setup();
  });

  beforeEach(async () => {
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const getValidFlightProps = (): FlightFactoryProps => ({
    flightNumber: 'LA3456',
    airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
    originIata: 'BSB',
    destinationIata: 'CGH',
    departureDatetime: new Date('2025-07-01T09:30:00Z'),
    arrivalDatetime: new Date('2025-07-01T10:30:00Z'),
    frequency: [1, 3, 5],
  });

  const createTestFlight = async () => {
    const flightProps = getValidFlightProps();
    const flight = FlightFactory.create(flightProps);

    await prisma.flight.create({
      data: {
        id: flight.id.getValue(),
        flightNumber: flight.flightNumber.getValue(),
        airlineId: flight.airlineId,
        originIata: flight.originIata.getValue(),
        destinationIata: flight.destinationIata.getValue(),
        departureDatetime: flight.departureDatetime,
        arrivalDatetime: flight.arrivalDatetime,
        frequency: flight.frequency.getValue(),
        createdAt: flight.createdAt,
        updatedAt: flight.updatedAt,
        deletedAt: flight.deletedAt,
      },
    });

    return flight;
  };

  const getValidItineraryProps = async (): Promise<ItineraryFactoryProps> => {
    const flight = await createTestFlight();
    return {
      flights: [flight],
    };
  };

  describe('create()', () => {
    it('should create an itinerary successfully', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itineraryEntity = ItineraryFactory.create(validItineraryProps);

      const createdItinerary = await repository.create(itineraryEntity);

      expect(createdItinerary).toBeInstanceOf(Itinerary);
      expect(createdItinerary.flights).toHaveLength(1);
      expect(createdItinerary.originIata).toBe('BSB');
      expect(createdItinerary.destinationIata).toBe('CGH');
      expect(createdItinerary.stops).toBe(0);

      const savedItinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryEntity.id.getValue() },
        include: {
          flights: {
            include: {
              flight: true,
            },
          },
        },
      });

      expect(savedItinerary).not.toBeNull();
      expect(savedItinerary?.flights).toHaveLength(1);
    });

    it('should create itinerary with multiple flights', async () => {
      const flight1 = await createTestFlight();
      const flight2Props: FlightFactoryProps = {
        flightNumber: 'LA7890',
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        originIata: 'CGH',
        destinationIata: 'IMP',
        departureDatetime: new Date('2025-07-01T11:15:00Z'),
        arrivalDatetime: new Date('2025-07-01T12:05:00Z'),
        frequency: [1, 3, 5],
      };
      const flight2 = FlightFactory.create(flight2Props);

      await prisma.flight.create({
        data: {
          id: flight2.id.getValue(),
          flightNumber: flight2.flightNumber.getValue(),
          airlineId: flight2.airlineId,
          originIata: flight2.originIata.getValue(),
          destinationIata: flight2.destinationIata.getValue(),
          departureDatetime: flight2.departureDatetime,
          arrivalDatetime: flight2.arrivalDatetime,
          frequency: flight2.frequency.getValue(),
          createdAt: flight2.createdAt,
          updatedAt: flight2.updatedAt,
          deletedAt: flight2.deletedAt,
        },
      });

      const itineraryProps: ItineraryFactoryProps = {
        flights: [flight1, flight2],
      };
      const itineraryEntity = ItineraryFactory.create(itineraryProps);

      const createdItinerary = await repository.create(itineraryEntity);

      expect(createdItinerary).toBeInstanceOf(Itinerary);
      expect(createdItinerary.flights).toHaveLength(2);
      expect(createdItinerary.stops).toBe(1);
    });
  });

  describe('findAll()', () => {
    it('should return all existing itineraries', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itinerary1 = ItineraryFactory.create(validItineraryProps);
      const itinerary2 = ItineraryFactory.create(
        await getValidItineraryProps(),
      );

      await repository.create(itinerary1);
      await repository.create(itinerary2);

      const itineraries = await repository.findAll();

      expect(itineraries).toHaveLength(2);
      expect(itineraries[0]).toBeInstanceOf(Itinerary);
    });

    it('should return empty array if no itineraries exist', async () => {
      const itineraries = await repository.findAll();
      expect(itineraries).toHaveLength(0);
    });

    it('should not return deleted itineraries', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itinerary = ItineraryFactory.create(validItineraryProps);
      await repository.create(itinerary);
      await repository.delete(itinerary.id.getValue());

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById()', () => {
    it('should find itinerary by id', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itineraryEntity = ItineraryFactory.create(validItineraryProps);
      await repository.create(itineraryEntity);

      const foundItinerary = await repository.findById(
        itineraryEntity.id.getValue(),
      );

      expect(foundItinerary).toBeInstanceOf(Itinerary);
      expect(foundItinerary?.id.equals(itineraryEntity.id)).toBe(true);
    });

    it('should return null if itinerary does not exist', async () => {
      const foundItinerary = await repository.findById(randomUUID());
      expect(foundItinerary).toBeNull();
    });

    it('should return null for deleted itinerary', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itinerary = ItineraryFactory.create(validItineraryProps);
      await repository.create(itinerary);
      await repository.delete(itinerary.id.getValue());

      const foundItinerary = await repository.findById(itinerary.id.getValue());

      expect(foundItinerary).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should mark itinerary as deleted (soft delete)', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itinerary = ItineraryFactory.create(validItineraryProps);
      await repository.create(itinerary);

      await repository.delete(itinerary.id.getValue());

      const deletedItinerary = await prisma.itinerary.findUnique({
        where: { id: itinerary.id.getValue() },
      });

      expect(deletedItinerary?.deletedAt).not.toBeNull();
    });

    it('should throw NotFoundException if itinerary does not exist', async () => {
      const nonExistentId = randomUUID();

      await expect(repository.delete(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if itinerary is already deleted', async () => {
      const validItineraryProps = await getValidItineraryProps();
      const itinerary = ItineraryFactory.create(validItineraryProps);
      await repository.create(itinerary);
      await repository.delete(itinerary.id.getValue());

      await expect(repository.delete(itinerary.id.getValue())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
