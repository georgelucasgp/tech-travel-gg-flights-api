import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AvailabilityController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/availability/search', () => {
    it('should accept valid search request and return proper format', async () => {
      const searchDto = {
        origin: 'BSB',
        destination: 'GIG',
        departure_date: '2025-07-01',
        airlines: ['LA'],
        max_stops: 0,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(searchDto)
        .expect(200);

      expect(response.body).toHaveProperty('outbound_itineraries');
      expect(response.body).toHaveProperty('inbound_itineraries');
      expect(Array.isArray(response.body.outbound_itineraries)).toBe(true);
      expect(Array.isArray(response.body.inbound_itineraries)).toBe(true);
    });

    it('should accept round trip search with return_date', async () => {
      const searchDto = {
        origin: 'BSB',
        destination: 'GIG',
        departure_date: '2025-07-01',
        return_date: '2025-07-10',
        airlines: ['LA', 'AZ'],
        max_stops: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(searchDto)
        .expect(200);

      expect(response.body).toHaveProperty('outbound_itineraries');
      expect(response.body).toHaveProperty('inbound_itineraries');
    });

    it('should validate required fields (origin missing)', async () => {
      const invalidDto = {
        destination: 'GIG',
        departure_date: '2025-07-01',
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate required fields (destination missing)', async () => {
      const invalidDto = {
        origin: 'BSB',
        departure_date: '2025-07-01',
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate required fields (departure_date missing)', async () => {
      const invalidDto = {
        origin: 'BSB',
        destination: 'GIG',
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate IATA codes format', async () => {
      const invalidDto = {
        origin: 'INVALID',
        destination: 'GIG',
        departure_date: '2025-07-01',
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate airline codes format', async () => {
      const invalidDto = {
        origin: 'BSB',
        destination: 'GIG',
        departure_date: '2025-07-01',
        airlines: ['INVALID'],
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate max_stops range', async () => {
      const invalidDto = {
        origin: 'BSB',
        destination: 'GIG',
        departure_date: '2025-07-01',
        max_stops: 10,
      };

      await request(app.getHttpServer())
        .post('/api/v1/availability/search')
        .send(invalidDto)
        .expect(400);
    });
  });
});
