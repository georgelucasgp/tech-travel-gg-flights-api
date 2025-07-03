import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AirlinesService } from './airlines.service';
import { IAirlineRepository } from '../domain/repositories/airline.repository';
import { Airline } from '../domain/entities/airline.entity';
import { CreateAirlineDto } from '../presentation/dto/create-airline.dto';
import { UpdateAirlineDto } from '../presentation/dto/update-airline.dto';
import { AirlineFactory } from './airline.factory';
import { randomUUID } from 'crypto';

describe('AirlinesService', () => {
  let service: AirlinesService;
  let mockRepository: jest.Mocked<IAirlineRepository>;

  const airlineId = randomUUID();

  const mockAirlineData: CreateAirlineDto = {
    name: 'LATAM Airlines',
    iata_code: 'LA',
  };

  const mockAirline = AirlineFactory.create({
    id: airlineId,
    ...mockAirlineData,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(async () => {
    const mockRepositoryFactory = (): jest.Mocked<IAirlineRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIataCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      recovery: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirlinesService,
        {
          provide: 'IAirlineRepository',
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<AirlinesService>(AirlinesService);
    mockRepository = module.get('IAirlineRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an airline successfully', async () => {
      jest.spyOn(mockRepository, 'findByIataCode').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockResolvedValue(mockAirline);

      const result = await service.create(mockAirlineData);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(expect.any(Airline));
      expect(result).toBe(mockAirline);
    });

    it('should throw ConflictException when IATA code already exists', async () => {
      jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(mockAirline);
      const createSpy = jest.spyOn(mockRepository, 'create');

      await expect(service.create(mockAirlineData)).rejects.toThrow(
        new ConflictException('Airline with IATA code LA already exists'),
      );
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findByIataCode').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockRejectedValue(error);

      await expect(service.create(mockAirlineData)).rejects.toThrow(
        'Database error',
      );
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when airline data is invalid', async () => {
      const invalidDto: CreateAirlineDto = {
        name: '',
        iata_code: 'INVALID',
      };

      await expect(service.create(invalidDto)).rejects.toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all airlines', async () => {
      const airlines = [mockAirline];
      const findAllSpy = jest
        .spyOn(mockRepository, 'findAll')
        .mockResolvedValue(airlines);

      const result = await service.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(airlines);
    });

    it('should return empty array when no airlines exist', async () => {
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

  describe('findById', () => {
    it('should return airline when found', async () => {
      const findByIdSpy = jest
        .spyOn(mockRepository, 'findById')
        .mockResolvedValue(mockAirline);

      const result = await service.findById(airlineId);

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(airlineId);
      expect(result).toBe(mockAirline);
    });

    it('should throw NotFoundException when airline not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      await expect(service.findById(airlineId)).rejects.toThrow(
        new NotFoundException(`Airline with ID ${airlineId} not found`),
      );
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockRejectedValue(error);

      await expect(service.findById(airlineId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateAirlineDto = {
      name: 'LATAM Airlines Updated',
      iata_code: 'LU',
    };

    it('should update airline successfully with all fields', async () => {
      const findByIdSpy = jest
        .spyOn(mockRepository, 'findById')
        .mockResolvedValue(mockAirline);
      const findByIataCodeSpy = jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockAirline);

      const result = await service.update(airlineId, updateDto);

      expect(findByIdSpy).toHaveBeenCalledWith(airlineId);
      expect(findByIataCodeSpy).toHaveBeenCalledWith('LU');
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Airline));
      expect(result).toBe(mockAirline);
    });

    it('should update only name when only name is provided', async () => {
      const partialUpdateDto: UpdateAirlineDto = {
        name: 'Updated Name Only',
      };

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      const findByIataCodeSpy = jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockAirline);

      const result = await service.update(airlineId, partialUpdateDto);

      expect(findByIataCodeSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Airline));
      expect(result).toBe(mockAirline);
    });

    it('should update only IATA code when only IATA code is provided', async () => {
      const partialUpdateDto: UpdateAirlineDto = {
        iata_code: 'NU',
      };

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      const findByIataCodeSpy = jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockAirline);

      const result = await service.update(airlineId, partialUpdateDto);

      expect(findByIataCodeSpy).toHaveBeenCalledWith('NU');
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Airline));
      expect(result).toBe(mockAirline);
    });

    it('should throw NotFoundException when airline not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);

      await expect(service.update(airlineId, updateDto)).rejects.toThrow(
        new NotFoundException(`Airline with ID ${airlineId} not found`),
      );
    });

    it('should throw ConflictException when new IATA code already exists', async () => {
      const existingAirline = AirlineFactory.create({
        id: randomUUID(),
        name: 'Another Airline',
        iata_code: 'LU',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(existingAirline);

      await expect(service.update(airlineId, updateDto)).rejects.toThrow(
        new ConflictException(
          'Another airline with IATA code LU already exists',
        ),
      );
    });

    it('should allow update with same IATA code (no change)', async () => {
      const sameIataUpdateDto: UpdateAirlineDto = {
        name: 'Updated Name',
        iata_code: 'LA',
      };

      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      jest
        .spyOn(mockRepository, 'findByIataCode')
        .mockResolvedValue(mockAirline);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockAirline);

      const result = await service.update(airlineId, sameIataUpdateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockAirline);
    });

    it('should throw error when repository update fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      jest.spyOn(mockRepository, 'findByIataCode').mockResolvedValue(null);
      jest.spyOn(mockRepository, 'update').mockRejectedValue(error);

      await expect(service.update(airlineId, updateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('remove', () => {
    it('should delete airline successfully', async () => {
      const findByIdSpy = jest
        .spyOn(mockRepository, 'findById')
        .mockResolvedValue(mockAirline);
      const deleteSpy = jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue(undefined);

      await expect(service.remove(airlineId)).resolves.toBeUndefined();

      expect(findByIdSpy).toHaveBeenCalledWith(airlineId);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(airlineId);
    });

    it('should throw NotFoundException when airline not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);
      const deleteSpy = jest.spyOn(mockRepository, 'delete');

      await expect(service.remove(airlineId)).rejects.toThrow(
        new NotFoundException(`Airline with ID ${airlineId} not found`),
      );

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should throw error when repository delete fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockAirline);
      jest.spyOn(mockRepository, 'delete').mockRejectedValue(error);

      await expect(service.remove(airlineId)).rejects.toThrow('Database error');
    });
  });
});
