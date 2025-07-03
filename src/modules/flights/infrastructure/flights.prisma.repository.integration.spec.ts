import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Flight } from '../domain/entities/flight.entity';
import { FlightsPrismaRepository } from './flights.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import {
  FlightFactory,
  FlightFactoryProps,
} from '../application/flight.factory';
import { FlightNumber, IataCode, Frequency } from '../domain/value-objects';

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
    helper = IntegrationTestHelper.getInstance(prisma);

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
    airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
    originIata: 'IMP',
    destinationIata: 'BSB',
    departureDatetime: new Date('2025-08-15T22:00:00Z'),
    arrivalDatetime: new Date('2025-08-16T00:30:00Z'),
    frequency: [1, 3, 5],
  });

  describe('create()', () => {
    it('should create a flight successfully', async () => {
      const validFlightProps = getValidFlightProps();
      const flightEntity = FlightFactory.create(validFlightProps);
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
      const flightFactoryProps: FlightFactoryProps = {
        ...getValidFlightProps(),
        flightNumber: 'AD4050',
        frequency: [0, 1, 2, 3, 4, 5, 6],
      };

      const flightEntity = FlightFactory.create(flightFactoryProps);
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
      const flight1 = FlightFactory.create(validFlightProps);
      const flight2 = FlightFactory.create({
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
      const flightEntity = FlightFactory.create(validFlightProps);
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

  describe('update()', () => {
    let flightEntity: Flight;

    beforeEach(async () => {
      const validFlightProps = getValidFlightProps();
      flightEntity = FlightFactory.create(validFlightProps);
      await repository.create(flightEntity);
    });

    it('should update flight number successfully', async () => {
      const originalUpdatedAt = flightEntity.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));

      flightEntity.changeFlightNumber(new FlightNumber('LA4000'));

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight).toBeInstanceOf(Flight);
      expect(updatedFlight.flightNumber.getValue()).toBe('LA4000');
      expect(updatedFlight.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.flightNumber).toBe('LA4000');
      expect(new Date(savedFlight?.updatedAt || 0).getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should update route successfully', async () => {
      flightEntity.changeRoute(new IataCode('BSB'), new IataCode('CGH'));

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight.originIata.getValue()).toBe('BSB');
      expect(updatedFlight.destinationIata.getValue()).toBe('CGH');

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.originIata).toBe('BSB');
      expect(savedFlight?.destinationIata).toBe('CGH');
    });

    it('should update frequency successfully', async () => {
      flightEntity.changeFrequency(new Frequency([0, 6]));

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight.frequency.getValue()).toEqual([0, 6]);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.frequency).toEqual([0, 6]);
    });

    it('should update schedule successfully', async () => {
      const newDeparture = new Date('2025-09-01T14:00:00Z');
      const newArrival = new Date('2025-09-01T16:00:00Z');

      flightEntity.changeSchedule(newDeparture, newArrival);

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight.departureDatetime).toEqual(newDeparture);
      expect(updatedFlight.arrivalDatetime).toEqual(newArrival);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.departureDatetime).toEqual(newDeparture);
      expect(savedFlight?.arrivalDatetime).toEqual(newArrival);
    });

    it('should update airline successfully', async () => {
      const newAirlineId = 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a';

      flightEntity.changeAirline(newAirlineId);

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight.airlineId).toBe(newAirlineId);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.airlineId).toBe(newAirlineId);
    });

    it('should handle multiple changes in single update', async () => {
      flightEntity.changeFlightNumber(new FlightNumber('LA9999'));
      flightEntity.changeRoute(new IataCode('CGH'), new IataCode('IMP'));
      flightEntity.changeFrequency(new Frequency([1, 2, 3, 4, 5]));

      const updatedFlight = await repository.update(flightEntity);

      expect(updatedFlight.flightNumber.getValue()).toBe('LA9999');
      expect(updatedFlight.originIata.getValue()).toBe('CGH');
      expect(updatedFlight.destinationIata.getValue()).toBe('IMP');
      expect(updatedFlight.frequency.getValue()).toEqual([1, 2, 3, 4, 5]);

      const savedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(savedFlight?.flightNumber).toBe('LA9999');
      expect(savedFlight?.originIata).toBe('CGH');
      expect(savedFlight?.destinationIata).toBe('IMP');
      expect(savedFlight?.frequency).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('delete()', () => {
    it('should soft delete flight', async () => {
      const validFlightProps = getValidFlightProps();
      const flightEntity = FlightFactory.create(validFlightProps);
      await repository.create(flightEntity);

      await repository.delete(flightEntity.id.getValue());

      const deletedFlight = await prisma.flight.findUnique({
        where: { id: flightEntity.id.getValue() },
      });

      expect(deletedFlight?.deletedAt).not.toBeNull();
    });
  });
});
