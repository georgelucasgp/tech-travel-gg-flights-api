import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IUserRepository } from '../domain/repositories/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UsersPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user);

    const savedUser = await this.prisma.user.create({
      data: persistenceData,
    });

    return UserMapper.toDomain(savedUser);
  }

  async findAll(showDeleted = false): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: showDeleted ? {} : { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => UserMapper.toDomain(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async update(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: persistenceData.id,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: persistenceData.id },
      data: {
        ...persistenceData,
        updatedAt: new Date(),
      },
    });

    return UserMapper.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async recovery(id: string): Promise<User> {
    const recovered = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return UserMapper.toDomain(recovered);
  }
}
