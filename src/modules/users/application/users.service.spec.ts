import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserRepository } from '../domain/repositories/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserFactory } from './user.factory';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';
import { randomUUID } from 'crypto';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUserRepository>;

  const userId = randomUUID();
  const mockUserData: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
  };
  const mockUser = UserFactory.create({
    id: userId,
    name: mockUserData.name,
    email: mockUserData.email,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(async () => {
    const mockRepositoryFactory = (): jest.Mocked<IUserRepository> => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      recovery: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(mockRepository, 'create')
        .mockResolvedValue(mockUser);
      const result = await service.create(mockUserData);
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(expect.any(User));
      expect(result).toBe(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(mockUser);
      await expect(service.create(mockUserData)).rejects.toThrow(
        new ConflictException(
          `User with email ${mockUserData.email} already exists`,
        ),
      );
    });

    it('should throw ConflictException if email exists but is deleted', async () => {
      const deletedUser = UserFactory.create({
        id: userId,
        name: mockUserData.name,
        email: mockUserData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(deletedUser);
      await expect(service.create(mockUserData)).rejects.toThrow(
        new ConflictException(
          `User with email ${mockUserData.email} already exists but is deleted. Use recovery endpoint to reactivate it.`,
        ),
      );
    });

    it('should throw error if repository fails', async () => {
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(mockRepository, 'create')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.create(mockUserData)).rejects.toThrow('DB error');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      jest.spyOn(mockRepository, 'findAll').mockResolvedValue(users);
      const result = await service.findAll();
      expect(result).toBe(users);
    });
    it('should return empty array if no users exist', async () => {
      jest.spyOn(mockRepository, 'findAll').mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
    it('should throw error if repository fails', async () => {
      jest
        .spyOn(mockRepository, 'findAll')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.findAll()).rejects.toThrow('DB error');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockUser);
      const result = await service.findById(userId);
      expect(result).toBe(mockUser);
    });
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);
      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });
    it('should throw error if repository fails', async () => {
      jest
        .spyOn(mockRepository, 'findById')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.findById(userId)).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };
    it('should update user successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(mockRepository, 'update')
        .mockResolvedValue(mockUser);
      const result = await service.update(userId, updateDto);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUser);
    });
    it('should throw ConflictException if new email already exists for another user', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      const anotherUser = UserFactory.create({
        id: randomUUID(),
        name: updateDto.name!,
        email: updateDto.email!,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(anotherUser);
      await expect(service.update(userId, updateDto)).rejects.toThrow(
        new ConflictException(
          `Another user with email ${updateDto.email} already exists`,
        ),
      );
    });
    it('should throw error if repository update fails', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(mockRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(mockRepository, 'update')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.update(userId, updateDto)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      const deleteSpy = jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue(undefined);
      await expect(service.remove(userId)).resolves.toBeUndefined();
      expect(deleteSpy).toHaveBeenCalledWith(userId);
    });
    it('should throw error if repository delete fails', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(mockRepository, 'delete')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.remove(userId)).rejects.toThrow('DB error');
    });
  });

  describe('recovery', () => {
    it('should recover deleted user', async () => {
      const deletedUser = UserFactory.create({
        id: userId,
        name: mockUserData.name,
        email: mockUserData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(deletedUser);
      const recoverySpy = jest
        .spyOn(mockRepository, 'recovery')
        .mockResolvedValue(mockUser);
      const result = await service.recovery(userId);
      expect(recoverySpy).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(null);
      await expect(service.recovery(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });
    it('should throw ConflictException if user is already active', async () => {
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(mockUser);
      await expect(service.recovery(userId)).rejects.toThrow(
        new ConflictException(`User with ID ${userId} is already active`),
      );
    });
    it('should throw error if repository recovery fails', async () => {
      const deletedUser = UserFactory.create({
        id: userId,
        name: mockUserData.name,
        email: mockUserData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });
      jest.spyOn(mockRepository, 'findById').mockResolvedValue(deletedUser);
      jest
        .spyOn(mockRepository, 'recovery')
        .mockRejectedValue(new Error('DB error'));
      await expect(service.recovery(userId)).rejects.toThrow('DB error');
    });
  });
});
