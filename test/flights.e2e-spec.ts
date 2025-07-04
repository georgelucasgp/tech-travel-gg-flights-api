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
import { UpdateFlightDto } from 'src/modules/flights/presentation/dto/update-flight.dto';
import { CreateFlightDto } from 'src/modules/flights/presentation/dto/create-flight.dto';

jest.setTimeout(30000);

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

  const getValidCreateFlightDto = (): CreateFlightDto => ({
    flight_number: 'LA3451',
    airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
    origin_iata: 'IMP',
    destination_iata: 'BSB',
    departure_datetime: new Date('2025-08-15T22:00:00.000Z'),
    arrival_datetime: new Date('2025-08-16T00:30:00.000Z'),
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
        flight_number: 'LA3451',
        airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        origin_iata: 'IMP',
        destination_iata: 'BSB',
        frequency: [1, 3, 5],
      });
      expect(response.body.departure_datetime).toBe('2025-08-15T22:00:00.000Z');
      expect(response.body.arrival_datetime).toBe('2025-08-16T00:30:00.000Z');
      expect(response.body.frequency).toEqual([1, 3, 5]);
    });

    it('should validate IATA codes are uppercase', async () => {
      const createFlightDto = {
        ...getValidCreateFlightDto(),
        origin_iata: 'IMP',
        destination_iata: 'BSB',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(201);

      expect(response.body.origin_iata).toBe('IMP');
      expect(response.body.destination_iata).toBe('BSB');
    });

    it('should reject invalid IATA codes', async () => {
      const createFlightDto: CreateFlightDto = {
        ...getValidCreateFlightDto(),
        origin_iata: 'INVALID',
      };

      await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(400);
    });

    it('should reject when arrival is before departure', async () => {
      const createFlightDto: CreateFlightDto = {
        ...getValidCreateFlightDto(),
        departure_datetime: new Date('2025-08-16T00:30:00.000Z'),
        arrival_datetime: new Date('2025-08-15T22:00:00.000Z'),
      };

      await request(app.getHttpServer())
        .post('/api/v1/flights')
        .send(createFlightDto)
        .expect(400);
    });

    it('should reject invalid frequency values', async () => {
      const createFlightDto: CreateFlightDto = {
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
      const flight2: CreateFlightDto = {
        ...getValidCreateFlightDto(),
        flight_number: 'LA7890',
        origin_iata: 'BSB',
        destination_iata: 'CGH',
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
        flight_number: expect.any(String),
        origin_iata: expect.any(String),
        destination_iata: expect.any(String),
      });
    });

    it('should filter by origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?origin=IMP')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].origin_iata).toBe('IMP');
    });

    it('should filter by destination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?destination=BSB')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].destination_iata).toBe('BSB');
    });

    it('should filter by airline code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?airline_code=LA')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/flights?origin=BSB&destination=CGH&airline_code=LA')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].origin_iata).toBe('BSB');
      expect(response.body[0].destination_iata).toBe('CGH');
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
        flight_number: 'LA3451',
        origin_iata: 'IMP',
        destination_iata: 'BSB',
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
      const updateDto: UpdateFlightDto = {
        flight_number: 'LA9999',
        airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        origin_iata: 'BSB',
        destination_iata: 'CGH',
        departure_datetime: new Date('2025-09-01T14:00:00.000Z'),
        arrival_datetime: new Date('2025-09-01T16:00:00.000Z'),
        frequency: [0, 6],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flight_number: 'LA9999',
        origin_iata: 'BSB',
        destination_iata: 'CGH',
        frequency: [0, 6],
      });
      expect(response.body.departure_datetime).toBe('2025-09-01T14:00:00.000Z');
      expect(response.body.arrival_datetime).toBe('2025-09-01T16:00:00.000Z');
    });

    it('should update only flight number', async () => {
      const updateDto = {
        flight_number: 'LA8888',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        flight_number: 'LA8888',
        origin_iata: originalFlight.origin_iata,
        destination_iata: originalFlight.destination_iata,
        frequency: originalFlight.frequency,
      });
    });

    it('should update only route (origin and destination)', async () => {
      const updateDto = {
        origin_iata: 'CGH',
        destination_iata: 'BSB',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        origin_iata: 'CGH',
        destination_iata: 'BSB',
        flight_number: originalFlight.flight_number,
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
        flight_number: originalFlight.flight_number,
        origin_iata: originalFlight.origin_iata,
        destination_iata: originalFlight.destination_iata,
      });
    });

    it('should update only schedule (departure and arrival times)', async () => {
      const updateDto = {
        departure_datetime: new Date('2025-10-01T08:00:00.000Z'),
        arrival_datetime: new Date('2025-10-01T10:00:00.000Z'),
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.departure_datetime).toBe('2025-10-01T08:00:00.000Z');
      expect(response.body.arrival_datetime).toBe('2025-10-01T10:00:00.000Z');

      expect(response.body.flight_number).toBe(originalFlight.flight_number);
      expect(response.body.origin_iata).toBe(originalFlight.origin_iata);
      expect(response.body.destination_iata).toBe(
        originalFlight.destination_iata,
      );
    });

    it('should update only airline', async () => {
      const updateDto = {
        airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        airline_id: 'e6a7c3b8-3b1a-4b9b-8e5e-6d0a7c4b3a2a',
        flight_number: originalFlight.flight_number,
        origin_iata: originalFlight.origin_iata,
        destination_iata: originalFlight.destination_iata,
        frequency: originalFlight.frequency,
      });
    });

    it('should return 404 when trying to update non-existent flight', async () => {
      const nonExistentId = randomUUID();
      const updateDto = { flight_number: 'LA9999' };

      await request(app.getHttpServer())
        .put(`/api/v1/flights/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const updateDto = { flight_number: 'LA9999' };

      await request(app.getHttpServer())
        .put('/api/v1/flights/invalid-uuid')
        .send(updateDto)
        .expect(400);
    });

    it('should reject invalid IATA codes', async () => {
      const updateDto = {
        origin_iata: 'INVALID',
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
        departure_datetime: new Date('2025-10-01T16:00:00.000Z'),
        arrival_datetime: new Date('2025-10-01T14:00:00.000Z'),
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
        flight_number: originalFlight.flight_number,
        origin_iata: originalFlight.origin_iata,
        destination_iata: originalFlight.destination_iata,
        frequency: originalFlight.frequency,
      });
    });

    it('should handle partial route update (only origin)', async () => {
      const originalFlight = await request(app.getHttpServer())
        .get(`/api/v1/flights/${flightId}`)
        .expect(200);

      const updateDto = {
        origin_iata: 'CGH',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/flights/${flightId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: flightId,
        origin_iata: 'CGH',
        destination_iata: originalFlight.body.destination_iata,
      });
    });

    it('should handle partial schedule update (only departure)', async () => {
      const updateDto = {
        departure_datetime: new Date('2025-10-01T08:00:00.000Z'),
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/flights/${flightId}`)
        .expect(200);

      expect(response.body.deleted_at).not.toBeNull();
    });
  });
});
