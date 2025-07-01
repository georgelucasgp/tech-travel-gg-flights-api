import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/database/prisma.service';
import { IntegrationTestHelper } from './helpers/integration-test.helper';

describe('FlightsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    helper = new IntegrationTestHelper(prisma);
    await helper.setup();
  });

  beforeEach(async () => {
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
    await app.close();
  });

  const getValidCreateFlightDto = () => ({
    flightNumber: 'LA3456',
    airlineId: helper.getTestAirlineId(),
    originIata: 'IMP',
    destinationIata: 'BSB',
    departureDatetime: '2025-08-15T22:00:00.000Z',
    arrivalDatetime: '2025-08-16T00:30:00.000Z',
    frequency: [1, 3, 5],
  });

  describe('POST /flights', () => {
    it('should create a new flight', async () => {
      const createFlightDto = getValidCreateFlightDto();

      const response = await request(app.getHttpServer())
        .post('/flights')
        .send(createFlightDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String) as string,
        flightNumber: 'LA3456',
        airlineId: helper.getTestAirlineId(),
        originIata: 'IMP',
        destinationIata: 'BSB',
        frequency: [1, 3, 5],
      });
      expect(response.body.departureDatetime).toBe('2025-08-15T22:00:00.000Z');
      expect(response.body.arrivalDatetime).toBe('2025-08-16T00:30:00.000Z');
      expect(response.body.frequency).toEqual([1, 3, 5]);
    });

    it('should validate IATA codes are uppercase', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        originIata: 'IMP',
        destinationIata: 'BSB',
      };

      const response = await request(app.getHttpServer())
        .post('/flights')
        .send(createFlightDto)
        .expect(201);

      expect(response.body.originIata).toBe('IMP');
      expect(response.body.destinationIata).toBe('BSB');
    });

    it('should reject invalid IATA codes', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        originIata: 'INVALID',
      };

      await request(app.getHttpServer())
        .post('/flights')
        .send(createFlightDto)
        .expect(400);
    });

    it('should reject when arrival is before departure', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        departureDatetime: '2025-08-16T00:30:00.000Z',
        arrivalDatetime: '2025-08-15T22:00:00.000Z',
      };

      await request(app.getHttpServer())
        .post('/flights')
        .send(createFlightDto)
        .expect(400);
    });

    it('should reject invalid frequency values', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        frequency: [1, 8], // 8 is invalid (should be 0-6)
      };

      await request(app.getHttpServer())
        .post('/flights')
        .send(createFlightDto)
        .expect(400);
    });
  });

  describe('GET /flights', () => {
    beforeEach(async () => {
      // Create test flights with different routes for filtering tests
      const flight1 = getValidCreateFlightDto(); // IMP -> BSB
      const flight2 = {
        ...getValidCreateFlightDto(),
        flightNumber: 'LA7890',
        originIata: 'BSB',
        destinationIata: 'CGH',
      };

      await request(app.getHttpServer()).post('/flights').send(flight1);
      await request(app.getHttpServer()).post('/flights').send(flight2);
    });

    it('should return all flights', async () => {
      const response = await request(app.getHttpServer())
        .get('/flights')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        flightNumber: expect.any(String),
        originIata: expect.any(String),
        destinationIata: expect.any(String),
      });
    });

    it('should filter by origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/flights?origin=IMP')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].originIata).toBe('IMP');
    });

    it('should filter by destination', async () => {
      const response = await request(app.getHttpServer())
        .get('/flights?destination=BSB')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].destinationIata).toBe('BSB');
    });

    it('should filter by airline code', async () => {
      const response = await request(app.getHttpServer())
        .get('/flights?airlineCode=LA')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/flights?origin=BSB&destination=CGH&airlineCode=LA')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].originIata).toBe('BSB');
      expect(response.body[0].destinationIata).toBe('CGH');
    });
  });

  describe('GET /flights/:id', () => {
    let flightId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/flights')
        .send(getValidCreateFlightDto());
      flightId = createResponse.body.id;
    });

    it('should return a specific flight', async () => {
      const response = await request(app.getHttpServer())
        .get(`/flights/${flightId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flightNumber: 'LA3456',
        originIata: 'IMP',
        destinationIata: 'BSB',
      });
    });

    it('should return 404 for non-existent flight', async () => {
      const nonExistentId = randomUUID();
      await request(app.getHttpServer())
        .get(`/flights/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/flights/invalid-uuid')
        .expect(400);
    });
  });

  describe('DELETE /flights/:id', () => {
    let flightId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/flights')
        .send(getValidCreateFlightDto());
      flightId = createResponse.body.id;
    });

    it('should delete a flight (soft delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/flights/${flightId}`)
        .expect(204);

      // Verify flight is not returned in list
      const response = await request(app.getHttpServer())
        .get('/flights')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return 404 when trying to delete non-existent flight', async () => {
      const nonExistentId = randomUUID();
      await request(app.getHttpServer())
        .delete(`/flights/${nonExistentId}`)
        .expect(404);
    });

    it('should return 404 when getting deleted flight', async () => {
      await request(app.getHttpServer())
        .delete(`/flights/${flightId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/flights/${flightId}`)
        .expect(404);
    });
  });
});
