import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserQueryDto } from './dto/user-query.dto';
import { BookingsService } from '../../bookings/application/bookings.service';
import { BookingResponseDto } from '../../bookings/presentation/dto/booking-response.dto';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'deleted_at',
    required: false,
    description: 'Include deleted users (true/false)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          created_at: '2025-07-01T10:00:00.000Z',
          updated_at: '2025-07-01T10:00:00.000Z',
          deleted_at: null,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          created_at: '2025-07-01T11:00:00.000Z',
          updated_at: '2025-07-01T11:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  async findAll(@Query() query: UserQueryDto): Promise<UserResponseDto[]> {
    const showDeleted = query.deleted_at === 'true';
    const users = await this.usersService.findAll(showDeleted);
    return users.map((user) => UserResponseDto.fromEntity(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Updated',
        email: 'john.updated@example.com',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recover a deleted user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User recovered successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User is already active',
    schema: {
      example: {
        statusCode: 409,
        message:
          'User with ID 123e4567-e89b-12d3-a456-426614174000 is already active',
        error: 'Conflict',
      },
    },
  })
  async recovery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.recovery(id);
    return UserResponseDto.fromEntity(user);
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get all bookings for a specific user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User bookings retrieved successfully',
    schema: {
      example: [
        {
          id: '789e4567-e89b-12d3-a456-426614174789',
          code: 'ABC123',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'CONFIRMED',
          created_at: '2025-07-01T10:00:00.000Z',
          updated_at: '2025-07-01T10:00:00.000Z',
          itinerary: {
            id: '456e4567-e89b-12d3-a456-426614174456',
            origin_iata: 'BSB',
            destination_iata: 'GIG',
            departure_datetime: '2025-07-01T09:30:00.000Z',
            arrival_datetime: '2025-07-01T12:05:00.000Z',
            total_duration_minutes: 155,
            stops: 1,
            flights: [],
          },
        },
      ],
    },
  })
  async getUserBookings(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findByUserId(id);
    return bookings.map((booking) => BookingResponseDto.fromEntity(booking));
  }
}
