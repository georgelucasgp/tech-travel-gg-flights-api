import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Flight } from '../domain/entities/flight.entity';
import { FlightsPrismaRepository } from './flights.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';

describe('FlightsPrismaRepository (Integration)', () => {
  let repository: FlightsPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightsPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<FlightsPrismaRepository>(FlightsPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    helper = new IntegrationTestHelper(prisma);

    await helper.setup();
  });

  beforeEach(async () => {
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const getValidFlightProps = () => ({
    flightNumber: 'LA3456',
    airlineId: helper.getTestAirlineId(),
    originIata: 'IMP',
    destinationIata: 'BSB',
    departureDatetime: new Date('2025-08-15T22:00:00Z'),
    arrivalDatetime: new Date('2025-08-16T00:30:00Z'),
    frequency: [1, 3, 5],
  });

  describe('create()', () => {
    it('should create a flight successfully', async () => {
      const validFlightProps = getValidFlightProps();
      const flightEntity = Flight.create(validFlightProps);
      const createdFlight = await repository.create(flightEntity);

      expect(createdFlight).toBeInstanceOf(Flight);
      expect(createdFlight.flightNumber.getValue()).toBe('LA3456');
      expect(createdFlight.originIata.getValue()).toBe('IMP');
      expect(createdFlight.destinationIata.getValue()).toBe('BSB');
      expect(createdFlight.frequency.getValue()).toEqual([1, 3, 5]);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight).not.toBeNull();
      expect(savedFlight?.flightNumber).toBe('LA3456');
    });

    it('should create flight with valid frequency', async () => {
      const flightProps = {
        ...getValidFlightProps(),
        flightNumber: 'AD4050',
        frequency: [0, 1, 2, 3, 4, 5, 6],
      };

      const flightEntity = Flight.create(flightProps);
      await repository.create(flightEntity);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.frequency).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('findAll()', () => {
    it('should return all existing flights', async () => {
      const validFlightProps = getValidFlightProps();
      const flight1 = Flight.create(validFlightProps);
      const flight2 = Flight.create({
        ...validFlightProps,
        flightNumber: 'AZ4050',
      });

      await repository.create(flight1);
      await repository.create(flight2);

      const flights = await repository.findAll();

      expect(flights).toHaveLength(2);
      expect(flights[0]).toBeInstanceOf(Flight);
    });

    it('should return empty array if no flights exist', async () => {
      const flights = await repository.findAll();
      expect(flights).toHaveLength(0);
    });
  });

  describe('findById()', () => {
    it('should find flight by id', async () => {
      const validFlightProps = getValidFlightProps();
      const flightEntity = Flight.create(validFlightProps);
      await repository.create(flightEntity);

      const foundFlight = await repository.findById(flightEntity.id.getValue());

      expect(foundFlight).toBeInstanceOf(Flight);
      expect(foundFlight?.flightNumber.getValue()).toBe('LA3456');
    });

    it('should return null if flight does not exist', async () => {
      const foundFlight = await repository.findById(randomUUID());
      expect(foundFlight).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should soft delete flight', async () => {
      const validFlightProps = getValidFlightProps();
      const flightEntity = Flight.create(validFlightProps);
      await repository.create(flightEntity);

      await repository.delete(flightEntity.id.getValue());

      const deletedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(deletedFlight?.deletedAt).not.toBeNull();
    });
  });
});
