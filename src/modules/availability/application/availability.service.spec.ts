import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { IAvailabilityRepository } from '../domain/repositories/availability.repository';
import { AvailabilitySearchDto } from '../presentation/dto/availability-search.dto';
import { ItinerariesService } from 'src/modules/itineraries/application/itineraries.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repository: jest.Mocked<IAvailabilityRepository>;

  beforeEach(async () => {
    const repositoryFactory = (): jest.Mocked<IAvailabilityRepository> => ({
      findAvailableFlights: jest.fn(),
      isFlightOperatingOnDate: jest.fn(),
      hasValidConnectionTime: jest.fn(),
    });

    const mockItinerariesService: jest.Mocked<Partial<ItinerariesService>> = {
      findByCriteria: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: 'IAvailabilityRepository',
          useFactory: repositoryFactory,
        },
        {
          provide: ItinerariesService,
          useValue: mockItinerariesService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    repository = module.get('IAvailabilityRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    const getValidSearchDto = (): AvailabilitySearchDto => ({
      origin: 'BSB',
      destination: 'GIG',
      departure_date: '2025-07-03',
      airlines: ['LA'],
      max_stops: 1,
    });

    describe('validation', () => {
      it('should throw BadRequestException when origin is missing', async () => {
        const searchDto = { ...getValidSearchDto(), origin: '' };

        await expect(service.search(searchDto)).rejects.toThrow(
          new BadRequestException('Origin is required'),
        );
      });

      it('should throw BadRequestException when destination is missing', async () => {
        const searchDto = { ...getValidSearchDto(), destination: '' };

        await expect(service.search(searchDto)).rejects.toThrow(
          new BadRequestException('Destination is required'),
        );
      });

      it('should throw BadRequestException when departure_date is missing', async () => {
        const searchDto = { ...getValidSearchDto(), departure_date: '' };

        await expect(service.search(searchDto)).rejects.toThrow(
          new BadRequestException('Departure date is required'),
        );
      });
    });

    describe('basic search functionality', () => {
      it('should return proper response structure for empty results', async () => {
        const searchDto = getValidSearchDto();
        repository.findAvailableFlights.mockResolvedValue([]);

        const result = await service.search(searchDto);

        expect(result).toEqual({
          outbound_itineraries: [],
          inbound_itineraries: [],
        });
      });

      it('should handle round-trip search when return_date is provided', async () => {
        const searchDto = {
          ...getValidSearchDto(),
          return_date: '2025-07-10',
        };
        const spy = jest.spyOn(repository, 'findAvailableFlights');
        spy.mockResolvedValue([]);

        const result = await service.search(searchDto);

        expect(result).toEqual({
          outbound_itineraries: [],
          inbound_itineraries: [],
        });

        expect(spy).toHaveBeenCalledTimes(4);
      });

      it('should call repository with correct parameters', async () => {
        const searchDto = getValidSearchDto();
        const spy = jest.spyOn(repository, 'findAvailableFlights');
        spy.mockResolvedValue([]);

        await service.search(searchDto);

        expect(spy).toHaveBeenCalledWith({
          origin: 'BSB',
          destination: 'GIG',
          date: new Date('2025-07-03'),
          airline_codes: ['LA'],
        });
      });

      it('should handle undefined airlines parameter', async () => {
        const searchDto = { ...getValidSearchDto(), airlines: undefined };
        const spy = jest.spyOn(repository, 'findAvailableFlights');
        spy.mockResolvedValue([]);

        await service.search(searchDto);

        expect(spy).toHaveBeenCalledWith({
          origin: 'BSB',
          destination: 'GIG',
          date: new Date('2025-07-03'),
          airline_codes: undefined,
        });
      });
    });
  });
});
