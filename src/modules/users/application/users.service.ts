import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { IUserRepository } from '../domain/repositories/user.repository';
import { User } from '../domain/entities/user.entity';
import { UserName, UserEmail } from '../domain/value-objects';
import { UserFactory } from './user.factory';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new ConflictException(
          `User with email ${createUserDto.email} already exists but is deleted. Use recovery endpoint to reactivate it.`,
        );
      }
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const user = UserFactory.create(createUserDto);
    return await this.userRepository.create(user);
  }

  async findAll(showDeleted = false): Promise<User[]> {
    return await this.userRepository.findAll(showDeleted);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );

      if (existingUser && !existingUser.id.equals(user.id)) {
        throw new ConflictException(
          `Another user with email ${updateUserDto.email} already exists`,
        );
      }
    }

    const updatedUser = User.create({
      id: user.id,
      name: updateUserDto.name ? new UserName(updateUserDto.name) : user.name,
      email: updateUserDto.email
        ? new UserEmail(updateUserDto.email)
        : user.email,
      createdAt: user.createdAt,
      updatedAt: new Date(),
      deletedAt: user.deletedAt,
    });

    return await this.userRepository.update(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }

  async recovery(id: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (!existingUser.deletedAt) {
      throw new ConflictException(`User with ID ${id} is already active`);
    }
    return await this.userRepository.recovery(id);
  }
}
