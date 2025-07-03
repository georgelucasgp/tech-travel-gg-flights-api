import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Airline } from '../domain/entities/airline.entity';
import { AirlinesPrismaRepository } from './airlines.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import { AirlineFactory } from '../application/airline.factory';

describe('AirlinesPrismaRepository (Integration)', () => {
  let repository: AirlinesPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirlinesPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<AirlinesPrismaRepository>(AirlinesPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);

    await helper.setup();
  });

  beforeEach(async () => {
    await prisma.airline.deleteMany();
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const getValidAirlineProps = (prefix = 'GG') => ({
    name: `${prefix} Airlines`,
    iataCode: `${prefix}`,
  });

  describe('create()', () => {
    it('should create an airline successfully', async () => {
      const validAirlineProps = getValidAirlineProps('GG');
      const airlineEntity = AirlineFactory.create(validAirlineProps);
      const createdAirline = await repository.create(airlineEntity);

      expect(createdAirline).toBeInstanceOf(Airline);
      expect(createdAirline.name.getValue()).toBe('GG Airlines');
      expect(createdAirline.iataCode.getValue()).toBe('GG');

      const savedAirline = await prisma.airline.findUnique({
        where: { id: airlineEntity.id.getValue() },
      });

      expect(savedAirline).not.toBeNull();
      expect(savedAirline?.name).toBe('GG Airlines');
      expect(savedAirline?.iataCode).toBe('GG');
    });
  });

  describe('findById()', () => {
    it('should find airline by id', async () => {
      const validAirlineProps = getValidAirlineProps('GG');
      const airlineEntity = AirlineFactory.create(validAirlineProps);
      await repository.create(airlineEntity);

      const foundAirline = await repository.findById(
        airlineEntity.id.getValue(),
      );

      expect(foundAirline).toBeInstanceOf(Airline);
      expect(foundAirline?.name.getValue()).toBe('GG Airlines');
      expect(foundAirline?.iataCode.getValue()).toBe('GG');
    });
  });

  describe('update()', () => {
    let airlineEntity: Airline;

    beforeEach(async () => {
      const validAirlineProps = getValidAirlineProps('GG');
      airlineEntity = AirlineFactory.create(validAirlineProps);
      await repository.create(airlineEntity);
    });

    it('should update airline name successfully', async () => {
      const originalUpdatedAt = airlineEntity.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedAirlineEntity = AirlineFactory.create({
        id: airlineEntity.id.getValue(),
        name: 'GG Airlines Group',
        iataCode: airlineEntity.iataCode.getValue(),
        createdAt: airlineEntity.createdAt,
        updatedAt: new Date(),
        deletedAt: airlineEntity.deletedAt,
      });

      const updatedAirline = await repository.update(updatedAirlineEntity);

      expect(updatedAirline).toBeInstanceOf(Airline);
      expect(updatedAirline.name.getValue()).toBe('GG Airlines Group');
      expect(updatedAirline.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      const savedAirline = await prisma.airline.findUnique({
        where: { id: airlineEntity.id.getValue() },
      });

      expect(savedAirline?.name).toBe('GG Airlines Group');
      expect(new Date(savedAirline?.updatedAt || 0).getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should update airline IATA code successfully', async () => {
      const updatedAirlineEntity = AirlineFactory.create({
        id: airlineEntity.id.getValue(),
        name: airlineEntity.name.getValue(),
        iataCode: 'JJ',
        createdAt: airlineEntity.createdAt,
        updatedAt: new Date(),
        deletedAt: airlineEntity.deletedAt,
      });

      const updatedAirline = await repository.update(updatedAirlineEntity);

      expect(updatedAirline.iataCode.getValue()).toBe('JJ');

      const savedAirline = await prisma.airline.findUnique({
        where: { id: airlineEntity.id.getValue() },
      });

      expect(savedAirline?.iataCode).toBe('JJ');
    });
  });

  describe('delete()', () => {
    it('should soft delete airline', async () => {
      const validAirlineProps = getValidAirlineProps('GG');
      const airlineEntity = AirlineFactory.create(validAirlineProps);
      await repository.create(airlineEntity);

      await repository.delete(airlineEntity.id.getValue());

      const deletedAirline = await prisma.airline.findUnique({
        where: { id: airlineEntity.id.getValue() },
      });

      expect(deletedAirline?.deletedAt).not.toBeNull();
    });
  });
});
