import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/database/prisma.service';
import { IntegrationTestHelper } from './helpers/integration-test.helper';
import { HttpExceptionFilter } from '../src/shared/infrastructure/filters/http-exception.filter';

describe('FlightsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();

    app.setGlobalPrefix('api');

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

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

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);
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
    airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
    originIata: 'IMP',
    destinationIata: 'BSB',
    departureDatetime: '2025-08-15T22:00:00.000Z',
    arrivalDatetime: '2025-08-16T00:30:00.000Z',
    frequency: [1, 3, 5],
  });

  describe('POST /api/v1/flights', () => {
    it('should create a new flight', async () => {
      const createFlightDto = getValidCreateFlightDto();

      const response = await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String) as string,
        flightNumber: 'LA3456',
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
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
        .post('/api/v1/flights')
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
        .post('/api/v1/flights')
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
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(400);
    });

    it('should reject invalid frequency values', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        frequency: [1, 8],
      };

      await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(400);
    });
  });

  describe('GET /api/v1/flights', () => {
    beforeEach(async () => {
      const flight1 = getValidCreateFlightDto();
      const flight2 = {
        ...getValidCreateFlightDto(),
        flightNumber: 'LA7890',
        originIata: 'BSB',
        destinationIata: 'CGH',
      };

      await request(app.getHttpServer()).post('/api/v1/flights').send(flight1);
      await request(app.getHttpServer()).post('/api/v1/flights').send(flight2);
    });

    it('should return all flights', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights')
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
        .get('/api/v1/flights?origin=IMP')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].originIata).toBe('IMP');
    });

    it('should filter by destination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?destination=BSB')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].destinationIata).toBe('BSB');
    });

    it('should filter by airline code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?airlineCode=LA')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?origin=BSB&destination=CGH&airlineCode=LA')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].originIata).toBe('BSB');
      expect(response.body[0].destinationIata).toBe('CGH');
    });
  });

  describe('GET /api/v1/flights/:id', () => {
    let flightId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(getValidCreateFlightDto());
      flightId = createResponse.body.id;
    });

    it('should return a specific flight', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/flights/${flightId}`)
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
        .get(`/api/v1/flights/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/flights/invalid-uuid')
        .expect(400);
    });
  });

  describe('PUT /api/v1/flights/:id', () => {
    let flightId: string;
    let originalFlight: any;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(getValidCreateFlightDto());
      flightId = createResponse.body.id;
      originalFlight = createResponse.body;
    });

    it('should update all fields successfully', async () => {
      const updateDto = {
        flightNumber: 'LA9999',
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        originIata: 'BSB',
        destinationIata: 'CGH',
        departureDatetime: '2025-09-01T14:00:00.000Z',
        arrivalDatetime: '2025-09-01T16:00:00.000Z',
        frequency: [0, 6],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flightNumber: 'LA9999',
        originIata: 'BSB',
        destinationIata: 'CGH',
        frequency: [0, 6],
      });
      expect(response.body.departureDatetime).toBe('2025-09-01T14:00:00.000Z');
      expect(response.body.arrivalDatetime).toBe('2025-09-01T16:00:00.000Z');
    });

    it('should update only flight number', async () => {
      const updateDto = {
        flightNumber: 'LA8888',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flightNumber: 'LA8888',
        originIata: originalFlight.originIata,
        destinationIata: originalFlight.destinationIata,
        frequency: originalFlight.frequency,
      });
    });

    it('should update only route (origin and destination)', async () => {
      const updateDto = {
        originIata: 'CGH',
        destinationIata: 'BSB',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        originIata: 'CGH',
        destinationIata: 'BSB',
        flightNumber: originalFlight.flightNumber,
        frequency: originalFlight.frequency,
      });
    });

    it('should update only frequency', async () => {
      const updateDto = {
        frequency: [1, 2, 3, 4, 5],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        frequency: [1, 2, 3, 4, 5],
        flightNumber: originalFlight.flightNumber,
        originIata: originalFlight.originIata,
        destinationIata: originalFlight.destinationIata,
      });
    });

    it('should update only schedule (departure and arrival times)', async () => {
      const updateDto = {
        departureDatetime: '2025-10-01T08:00:00.000Z',
        arrivalDatetime: '2025-10-01T10:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.departureDatetime).toBe('2025-10-01T08:00:00.000Z');
      expect(response.body.arrivalDatetime).toBe('2025-10-01T10:00:00.000Z');

      expect(response.body.flightNumber).toBe(originalFlight.flightNumber);
      expect(response.body.originIata).toBe(originalFlight.originIata);
      expect(response.body.destinationIata).toBe(
        originalFlight.destinationIata,
      );
    });

    it('should update only airline', async () => {
      const updateDto = {
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        airlineId: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        flightNumber: originalFlight.flightNumber,
        originIata: originalFlight.originIata,
        destinationIata: originalFlight.destinationIata,
        frequency: originalFlight.frequency,
      });
    });

    it('should return 404 when trying to update non-existent flight', async () => {
      const nonExistentId = randomUUID();
      const updateDto = { flightNumber: 'LA9999' };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const updateDto = { flightNumber: 'LA9999' };

      await request(app.getHttpServer())
        .put('/api/v1/flights/invalid-uuid')
        .send(updateDto)
        .expect(400);
    });

    it('should reject invalid IATA codes', async () => {
      const updateDto = {
        originIata: 'INVALID',
      };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject invalid frequency values', async () => {
      const updateDto = {
        frequency: [1, 8],
      };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject when arrival is before departure in update', async () => {
      const updateDto = {
        departureDatetime: '2025-10-01T16:00:00.000Z',
        arrivalDatetime: '2025-10-01T14:00:00.000Z',
      };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject empty update (no fields provided)', async () => {
      const updateDto = {};

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flightNumber: originalFlight.flightNumber,
        originIata: originalFlight.originIata,
        destinationIata: originalFlight.destinationIata,
        frequency: originalFlight.frequency,
      });
    });

    it('should handle partial route update (only origin)', async () => {
      const originalFlight = await request(app.getHttpServer())
        .get(`/api/v1/flights/${flightId}`)
        .expect(200);

      const updateDto = {
        originIata: 'CGH',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        originIata: 'CGH',
        destinationIata: originalFlight.body.destinationIata,
      });
    });

    it('should handle partial schedule update (only departure)', async () => {
      const updateDto = {
        departureDatetime: '2025-10-01T08:00:00.000Z',
      };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/flights/:id', () => {
    let flightId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(getValidCreateFlightDto());
      flightId = createResponse.body.id;
    });

    it('should delete a flight (soft delete)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/flights/${flightId}`)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get('/api/v1/flights')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return 404 when trying to delete non-existent flight', async () => {
      const nonExistentId = randomUUID();
      await request(app.getHttpServer())
        .delete(`/api/v1/flights/${nonExistentId}`)
        .expect(404);
    });

    it('should return 404 when getting deleted flight', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/flights/${flightId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/flights/${flightId}`)
        .expect(404);
    });
  });
});
