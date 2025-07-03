import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Airport } from '../domain/entities/airport.entity';
import { AirportsPrismaRepository } from './airports.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import { AirportFactory } from '../application/airport.factory';
import { AirportName, AirportIataCode } from '../domain/value-objects';

describe('AirportsPrismaRepository (Integration)', () => {
  let repository: AirportsPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirportsPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<AirportsPrismaRepository>(AirportsPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);

    await helper.setup();
  });

  beforeEach(async () => {
    await prisma.airport.deleteMany();
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const getValidAirportProps = (iataCode = 'BSB') => ({
    name: 'Aeroporto Internacional de Brasília',
    iata_code: iataCode,
    city: 'Brasília',
    country: 'Brasil',
    timezone: 'America/Sao_Paulo',
  });

  describe('create()', () => {
    it('should create an airport successfully', async () => {
      const validAirportProps = getValidAirportProps('BSB');
      const airportEntity = AirportFactory.create(validAirportProps);
      const createdAirport = await repository.create(airportEntity);

      expect(createdAirport).toBeInstanceOf(Airport);
      expect(createdAirport.name.getValue()).toBe(
        'Aeroporto Internacional de Brasília',
      );
      expect(createdAirport.iataCode.getValue()).toBe('BSB');
      expect(createdAirport.city.getValue()).toBe('Brasília');
      expect(createdAirport.country.getValue()).toBe('Brasil');
      expect(createdAirport.timezone.getValue()).toBe('America/Sao_Paulo');
    });
  });

  describe('findById()', () => {
    it('should find airport by id', async () => {
      const validAirportProps = getValidAirportProps('GRU');
      const airportEntity = AirportFactory.create(validAirportProps);
      await repository.create(airportEntity);

      const foundAirport = await repository.findById(
        airportEntity.id.getValue(),
      );

      expect(foundAirport).toBeInstanceOf(Airport);
      expect(foundAirport?.name.getValue()).toBe(
        'Aeroporto Internacional de Brasília',
      );
      expect(foundAirport?.iataCode.getValue()).toBe('GRU');
    });
  });

  describe('update()', () => {
    let airportEntity: Airport;

    beforeEach(async () => {
      const validAirportProps = getValidAirportProps('IMP');
      airportEntity = AirportFactory.create(validAirportProps);
      await repository.create(airportEntity);
    });

    it('should update airport name successfully', async () => {
      const originalUpdatedAt = airportEntity.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 1));
      airportEntity.changeName(
        new AirportName('Brasília International Airport'),
      );
      const updatedAirport = await repository.update(airportEntity);
      expect(updatedAirport).toBeInstanceOf(Airport);
      expect(updatedAirport.name.getValue()).toBe(
        'Brasília International Airport',
      );
      expect(updatedAirport.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
      const savedAirport = await prisma.airport.findUnique({
        where: { id: airportEntity.id.getValue() },
      });
      expect(savedAirport?.name).toBe('Brasília International Airport');
      expect(new Date(savedAirport?.updatedAt || 0).getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should update IATA code successfully', async () => {
      airportEntity.changeIataCode(new AirportIataCode('BSC'));
      const updatedAirport = await repository.update(airportEntity);
      expect(updatedAirport.iataCode.getValue()).toBe('BSC');
      const savedAirport = await prisma.airport.findUnique({
        where: { id: airportEntity.id.getValue() },
      });
      expect(savedAirport?.iataCode).toBe('BSC');
    });
  });

  describe('delete()', () => {
    it('should soft delete airport', async () => {
      const validAirportProps = getValidAirportProps('VCP');
      const airportEntity = AirportFactory.create(validAirportProps);
      await repository.create(airportEntity);
      await repository.delete(airportEntity.id.getValue());
      const deletedAirport = await prisma.airport.findUnique({
        where: { id: airportEntity.id.getValue() },
      });
      expect(deletedAirport?.deletedAt).not.toBeNull();
    });
  });
});
