import { Test, TestingModule } from '@nestjs/testing';
import { Flight } from '../domain/entities/flight.entity';
import { IFlightRepository } from '../domain/repositories/flight.repository';
import { CreateFlightDto } from '../presentation/dto/create-flight.dto';
import { UpdateFlightDto } from '../presentation/dto/update-flight.dto';
import { FlightsService } from './flights.service';
import { randomUUID } from 'crypto';
import { FlightFactory } from './flight.factory';

describe('FlightsService', () => {
  let service: FlightsService;
  let mockRepository: jest.Mocked<IFlightRepository>;

  const airlineId = randomUUID();
  const flightId = randomUUID();

  const mockFlightData: CreateFlightDto = {
    flight_number: 'LA3000',
    airline_id: airlineId,
    origin_iata: 'IMP',
    destination_iata: 'BSB',
    departure_datetime: new Date('2025-10-01T10:00:00Z'),
    arrival_datetime: new Date('2025-10-01T12:00:00Z'),
    frequency: [1, 2, 3],
  };

  const mockFlight = FlightFactory.create(mockFlightData);

  beforeEach(async () => {
    const mockRepositoryFactory = (): jest.Mocked<IFlightRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByFlightNumber: jest.fn(),
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
      jest.spyOn(mockRepository, 'findByFlightNumber').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockResolvedValue(mockFlight);

      const result = await service.create(mockFlightData);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(expect.any(Flight));
      expect(result).toBe(mockFlight);
    });

    it('should throw BadRequestException when flight already exists', async () => {
      jest
        .spyOn(mockRepository, 'findByFlightNumber')
        .mockResolvedValue(mockFlight);
      const createSpy = jest.spyOn(mockRepository, 'create');

      await expect(service.create(mockFlightData)).rejects.toThrow(
        'Flight already exists',
      );
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findByFlightNumber').mockResolvedValue(null);
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
        flight_number: 'INVALID_FLIGHT_NUMBER_TOO_LONG',
      };

      await expect(service.create(invalidDto)).rejects.toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all flights', async () => {
      const flights = [mockFlight];
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue(flights);

      const result = await service.findAll({});

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(flights);
    });

    it('should return empty array when no flights exist', async () => {
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue([]);

      const result = await service.findAll({});

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findAll').mockRejectedValue(error);

      await expect(service.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return flight when found', async () => {
      const findByIdSpy = jest
        .spyOn(mockRepository, 'findById')
        .mockResolvedValue(mockFlight);

      const result = await service.findById(flightId);

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(flightId);
      expect(result).toBe(mockFlight);
    });

    it('should throw NotFoundException when flight not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      await expect(service.findById(flightId)).rejects.toThrow(
        'Flight not found',
      );
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockRejectedValue(error);

      await expect(service.findById(flightId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update flight successfully with all fields', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockFlight);

      const updateDto: UpdateFlightDto = {
        flight_number: 'LA4000',
        airline_id: '301cc2b2-f6d2-461f-a284-bf58f00286d3',
        origin_iata: 'GRU',
        destination_iata: 'CGH',
        departure_datetime: new Date('2025-11-01T14:00:00Z'),
        arrival_datetime: new Date('2025-11-01T16:00:00Z'),
        frequency: [0, 6],
      };

      const result = await service.update(flightId, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(mockFlight);
      expect(result).toBe(mockFlight);
    });

    it('should update only frequency when only frequency is provided', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockFlight);

      const updateDto: UpdateFlightDto = {
        frequency: [0, 1, 2, 3, 4, 5, 6],
      };

      const result = await service.update(flightId, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(mockFlight);
      expect(result).toBe(mockFlight);
    });

    it('should update only route when origin and destination are provided', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockFlight);

      const updateDto: UpdateFlightDto = {
        origin_iata: 'GRU',
        destination_iata: 'SDU',
      };

      const result = await service.update(flightId, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(mockFlight);
      expect(result).toBe(mockFlight);
    });

    it('should update only schedule when departure and arrival times are provided', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockFlight);

      const updateDto: UpdateFlightDto = {
        departure_datetime: new Date('2025-12-01T08:00:00Z'),
        arrival_datetime: new Date('2025-12-01T10:00:00Z'),
      };

      const result = await service.update(flightId, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(mockFlight);
      expect(result).toBe(mockFlight);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      jest.spyOn(mockRepository, 'update').mockRejectedValue(error);

      const updateDto: UpdateFlightDto = { frequency: [1, 3, 5] };

      await expect(service.update(flightId, updateDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should throw error when flight not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      const updateDto: UpdateFlightDto = { frequency: [1, 3, 5] };

      await expect(service.update(flightId, updateDto)).rejects.toThrow(
        'Flight not found',
      );
    });
  });

  describe('findByFlightNumber', () => {
    it('should return flight when found', async () => {
      const findByFlightNumberSpy = jest
        .spyOn(mockRepository, 'findByFlightNumber')
        .mockResolvedValue(mockFlight);

      const result = await service.findByFlightNumber(
        mockFlightData.flight_number,
      );

      expect(findByFlightNumberSpy).toHaveBeenCalledTimes(1);
      expect(findByFlightNumberSpy).toHaveBeenCalledWith(
        mockFlightData.flight_number,
      );
      expect(result).toBe(mockFlight);
    });

    it('should throw NotFoundException when flight not found', async () => {
      jest.spyOn(mockRepository, 'findByFlightNumber').mockResolvedValue(null);

      await expect(
        service.findByFlightNumber(mockFlightData.flight_number),
      ).rejects.toThrow('Flight not found');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findByFlightNumber').mockRejectedValue(error);

      await expect(
        service.findByFlightNumber(mockFlightData.flight_number),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete flight successfully', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      jest.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

      await expect(service.delete(flightId)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when flight not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      await expect(service.delete(flightId)).rejects.toThrow(
        'Flight not found',
      );
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockFlight);
      jest.spyOn(mockRepository, 'delete').mockRejectedValue(error);

      await expect(service.delete(flightId)).rejects.toThrow('Database error');
    });
  });
});
