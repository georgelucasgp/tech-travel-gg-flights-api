import { Test, TestingModule } from '@nestjs/testing';
import { Flight } from '../domain/flight.entity';
import { IFlightRepository } from '../domain/flight.repository';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { FlightsService } from './flights.service';
import { randomUUID } from 'crypto';

describe('FlightsService', () => {
  let service: FlightsService;
  let mockRepository: jest.Mocked<IFlightRepository>;

  const airlineId = randomUUID();
  const flightId = randomUUID();

  const mockFlightData: CreateFlightDto = {
    flightNumber: 'LA3000',
    airlineId,
    originIata: 'IMP',
    destinationIata: 'BSB',
    departureDatetime: new Date('2025-10-01T10:00:00Z'),
    arrivalDatetime: new Date('2025-10-01T12:00:00Z'),
    frequency: [1, 2, 3],
  };

  const mockFlight = Flight.create(mockFlightData, flightId);

  beforeEach(async () => {
    const mockRepositoryFactory = (): jest.Mocked<IFlightRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        {
          provide: 'IFlightRepository',
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
    mockRepository = module.get('IFlightRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a flight successfully', async () => {
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockResolvedValue(mockFlight);

      const result = await service.create(mockFlightData);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(expect.any(Flight));
      expect(result).toBe(mockFlight);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockRejectedValue(error);

      await expect(service.create(mockFlightData)).rejects.toThrow(
        'Database error',
      );
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when flight data is invalid', async () => {
      const invalidDto: CreateFlightDto = {
        ...mockFlightData,
        flightNumber: 'INVALID',
      };
      const createSpy = jest.spyOn(mockRepository, 'create');

      await expect(service.create(invalidDto)).rejects.toBeDefined();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all flights', async () => {
      const flights = [mockFlight];
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue(flights);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(flights);
    });

    it('should return empty array when no flights exist', async () => {
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue([]);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findAll').mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });
});
