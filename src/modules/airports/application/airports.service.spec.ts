import { Test, TestingModule } from '@nestjs/testing';

import { AirportsService } from './airports.service';
import { IAirportRepository } from '../domain/repositories/airport.repository';

import { CreateAirportDto } from '../presentation/dto/create-airport.dto';
import { UpdateAirportDto } from '../presentation/dto/update-airport.dto';
import { AirportFactory } from './airport.factory';
import { randomUUID } from 'crypto';

describe('AirportsService', () => {
  let service: AirportsService;
  let mockRepository: jest.Mocked<IAirportRepository>;

  const mockAirportData: CreateAirportDto = {
    name: 'Aeroporto Internacional de Brasília',
    iata_code: 'BSB',
    city: 'Brasília',
    country: 'Brasil',
    timezone: 'America/Sao_Paulo',
  };

  const mockAirport = AirportFactory.create(mockAirportData);

  beforeEach(async () => {
    const mockRepositoryFactory = (): jest.Mocked<IAirportRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIataCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirportsService,
        {
          provide: 'IAirportRepository',
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<AirportsService>(AirportsService);
    mockRepository = module.get('IAirportRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create airport successfully', async () => {
      jest.spyOn(mockRepository, 'findByIataCode').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockResolvedValue(mockAirport);

      const result = await service.create(mockAirportData);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockAirport);
    });

    it('should throw BadRequestException if airport with IATA code already exists', async () => {
      jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(mockAirport);
      const createSpy = jest.spyOn(mockRepository, 'create');

      await expect(service.create(mockAirportData)).rejects.toThrow(
        'Airport already exists',
      );
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all airports', async () => {
      const airports = [mockAirport];
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue(airports);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(airports);
    });

    it('should return empty array when no airports exist', async () => {
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue([]);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return airport when found', async () => {
      const airportId = randomUUID();
      const findByIdSpy = jest
        .spyOn(mockRepository, 'findById')
        .mockResolvedValue(mockAirport);

      const result = await service.findById(airportId);

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(airportId);
      expect(result).toBe(mockAirport);
    });

    it('should throw NotFoundException when airport not found', async () => {
      const airportId = randomUUID();
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      await expect(service.findById(airportId)).rejects.toThrow(
        'Airport with ID',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateAirportDto = {
      name: 'Brasília International Airport',
      city: 'Brasília DF',
    };

    it('should update airport successfully', async () => {
      const airportId = randomUUID();
      const updatedAirport = AirportFactory.create({
        id: airportId,
        name: updateDto.name!,
        iata_code: 'BSB',
        city: updateDto.city!,
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
      });

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirport);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(updatedAirport);

      const result = await service.update(airportId, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(updatedAirport);
    });

    it('should throw NotFoundException when airport not found', async () => {
      const airportId = randomUUID();
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);
      const updateSpy = jest.spyOn(mockRepository, 'update');

      await expect(service.update(airportId, updateDto)).rejects.toThrow(
        'Airport with ID',
      );
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating IATA code to existing one', async () => {
      const airportId = randomUUID();
      const updateDtoWithIata: UpdateAirportDto = {
        ...updateDto,
        iata_code: 'GRU',
      };
      const anotherAirport = AirportFactory.create({
        name: 'Guarulhos Airport',
        iata_code: 'GRU',
        city: 'São Paulo',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
      });

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirport);
      jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(anotherAirport);
      const updateSpy = jest.spyOn(mockRepository, 'update');

      await expect(
        service.update(airportId, updateDtoWithIata),
      ).rejects.toThrow('Another airport with this IATA code already exists');
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should allow updating IATA code to same value', async () => {
      const airportId = randomUUID();
      const updateDtoWithSameIata: UpdateAirportDto = {
        ...updateDto,
        iata_code: 'BSB',
      };

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirport);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockAirport);

      await service.update(airportId, updateDtoWithSameIata);

      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove airport successfully', async () => {
      const airportId = randomUUID();
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirport);
      const deleteSpy = jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue();

      await service.remove(airportId);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(airportId);
    });

    it('should throw NotFoundException when airport not found', async () => {
      const airportId = randomUUID();
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);
      const deleteSpy = jest.spyOn(mockRepository, 'delete');

      await expect(service.remove(airportId)).rejects.toThrow(
        'Airport with ID',
      );
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
});
