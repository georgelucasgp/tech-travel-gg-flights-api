import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { IItineraryRepository } from '../domain/repositories/itinerary.repository';
import { IFlightRepository } from '../../flights/domain/repositories/flight.repository';
import { Itinerary } from '../domain/entities/itinerary.entity';
import { CreateItineraryDto } from '../presentation/dto/create-itinerary.dto';
import { FlightFactory } from '../../flights/application/flight.factory';
import { ItineraryFactory } from './itinerary.factory';
import { randomUUID } from 'crypto';

describe('ItinerariesService', () => {
  let service: ItinerariesService;
  let mockItineraryRepository: jest.Mocked<IItineraryRepository>;
  let mockFlightRepository: jest.Mocked<IFlightRepository>;

  const flightOneId = randomUUID();
  const flightTwoId = randomUUID();
  const itineraryId = randomUUID();

  const mockFlightOne = FlightFactory.create({
    id: flightOneId,
    flight_number: 'LA3456',
    airline_id: '301cc2b2-f6d2-461f-a284-bf58f00286d3',
    origin_iata: 'IMP',
    destination_iata: 'BSB',
    departure_datetime: new Date('2025-07-01T09:30:00Z'),
    arrival_datetime: new Date('2025-07-01T10:30:00Z'),
    frequency: [1, 2, 3, 4, 5],
  });

  const mockFlightTwo = FlightFactory.create({
    id: flightTwoId,
    flight_number: 'LA7890',
    airline_id: '301cc2b2-f6d2-461f-a284-bf58f00286d3',
    origin_iata: 'BSB',
    destination_iata: 'GRU',
    departure_datetime: new Date('2025-07-01T11:15:00Z'),
    arrival_datetime: new Date('2025-07-01T12:05:00Z'),
    frequency: [1, 2, 3, 4, 5],
  });

  const mockItinerary = ItineraryFactory.create({
    id: itineraryId,
    flights: [mockFlightOne, mockFlightTwo],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(async () => {
    const mockItineraryRepositoryFactory = () => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    });

    const mockFlightRepositoryFactory = () => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByFlightNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItinerariesService,
        {
          provide: 'IItineraryRepository',
          useFactory: mockItineraryRepositoryFactory,
        },
        {
          provide: 'IFlightRepository',
          useFactory: mockFlightRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<ItinerariesService>(ItinerariesService);
    mockItineraryRepository = module.get('IItineraryRepository');
    mockFlightRepository = module.get('IFlightRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateItineraryDto = {
      flight_ids: [flightOneId, flightTwoId],
    };

    it('should create an itinerary successfully with valid flights', async () => {
      jest
        .spyOn(mockFlightRepository, 'findById')
        .mockResolvedValueOnce(mockFlightOne)
        .mockResolvedValueOnce(mockFlightTwo);

      const createSpy = jest
        .spyOn(mockItineraryRepository, 'create')
        .mockResolvedValue(mockItinerary);

      const result = await service.create(createDto);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(expect.any(Itinerary));
      expect(result).toBe(mockItinerary);
    });

    it('should throw BadRequestException when flight not found', async () => {
      jest
        .spyOn(mockFlightRepository, 'findById')
        .mockResolvedValueOnce(mockFlightOne)
        .mockResolvedValueOnce(null);

      const createSpy = jest
        .spyOn(mockItineraryRepository, 'create')
        .mockResolvedValue(mockItinerary);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(`Flight with ID ${flightTwoId} not found`),
      );

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when itinerary validation fails', async () => {
      const invalidFlight = FlightFactory.create({
        id: flightTwoId,
        flight_number: 'LA7890',
        airline_id: '301cc2b2-f6d2-461f-a284-bf58f00286d3',
        origin_iata: 'IMP',
        destination_iata: 'GRU',
        departure_datetime: new Date('2025-07-01T11:15:00Z'),
        arrival_datetime: new Date('2025-07-01T12:05:00Z'),
        frequency: [1, 2, 3, 4, 5],
      });

      jest
        .spyOn(mockFlightRepository, 'findById')
        .mockResolvedValueOnce(mockFlightOne)
        .mockResolvedValueOnce(invalidFlight);

      const createSpy = jest
        .spyOn(mockItineraryRepository, 'create')
        .mockResolvedValue(mockItinerary);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest
        .spyOn(mockFlightRepository, 'findById')
        .mockResolvedValueOnce(mockFlightOne)
        .mockResolvedValueOnce(mockFlightTwo);

      const createSpy = jest
        .spyOn(mockItineraryRepository, 'create')
        .mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow('Database error');

      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all itineraries', async () => {
      const itineraries = [mockItinerary];

      const findAllSpy = jest
        .spyOn(mockItineraryRepository, 'findAll')
        .mockResolvedValue(itineraries);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(itineraries);
    });

    it('should return empty array when no itineraries exist', async () => {
      const findAllSpy = jest
        .spyOn(mockItineraryRepository, 'findAll')
        .mockResolvedValue([]);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');

      const findAllSpy = jest
        .spyOn(mockItineraryRepository, 'findAll')
        .mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');

      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return itinerary when found', async () => {
      jest
        .spyOn(mockItineraryRepository, 'findById')
        .mockResolvedValue(mockItinerary);

      const result = await service.findById(itineraryId);

      expect(result).toBe(mockItinerary);
    });

    it('should throw NotFoundException when itinerary not found', async () => {
      jest.spyOn(mockItineraryRepository, 'findById').mockResolvedValue(null);

      await expect(service.findById(itineraryId)).rejects.toThrow(
        new NotFoundException('Itinerary not found'),
      );
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockItineraryRepository, 'findById').mockRejectedValue(error);

      await expect(service.findById(itineraryId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should delete itinerary successfully', async () => {
      jest
        .spyOn(mockItineraryRepository, 'findById')
        .mockResolvedValue(mockItinerary);
      const deleteSpy = jest
        .spyOn(mockItineraryRepository, 'delete')
        .mockResolvedValue(undefined);

      await expect(service.delete(itineraryId)).resolves.toBeUndefined();

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(itineraryId);
    });

    it('should throw NotFoundException when itinerary not found', async () => {
      jest.spyOn(mockItineraryRepository, 'findById').mockResolvedValue(null);

      await expect(service.delete(itineraryId)).rejects.toThrow(
        new NotFoundException('Itinerary not found'),
      );
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest
        .spyOn(mockItineraryRepository, 'findById')
        .mockResolvedValue(mockItinerary);
      jest.spyOn(mockItineraryRepository, 'delete').mockRejectedValue(error);

      await expect(service.delete(itineraryId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
