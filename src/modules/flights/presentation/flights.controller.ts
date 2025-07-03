import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  NotFoundException,
  Query,
  Put,
} from '@nestjs/common';
import { FlightsService } from '../application/flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import { FlightQueryDto } from './dto/flight-query.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Flights')
@Controller({ path: 'flights', version: '1' })
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({
    status: 201,
    description: 'Flight created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        flight_number: 'LA3456',
        airline_id: '456e4567-e89b-12d3-a456-426614174456',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T12:05:00.000Z',
        frequency: [1, 2, 3, 4, 5],
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or flight already exists',
    schema: {
      example: {
        statusCode: 400,
        message: 'Flight already exists',
        error: 'Bad Request',
      },
    },
  })
  async create(
    @Body() createFlightDto: CreateFlightDto,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.create(createFlightDto);
    return FlightResponseDto.fromEntity(flight);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flights' })
  @ApiQuery({
    name: 'airline_code',
    required: false,
    description: 'Filter by airline IATA code',
    example: 'LA',
  })
  @ApiQuery({
    name: 'origin',
    required: false,
    description: 'Filter by origin IATA code',
    example: 'BSB',
  })
  @ApiQuery({
    name: 'destination',
    required: false,
    description: 'Filter by destination IATA code',
    example: 'GIG',
  })
  @ApiQuery({
    name: 'deleted_at',
    required: false,
    description: 'Include deleted flights (true/false)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: 'Flights retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          flight_number: 'LA3456',
          airline_id: '456e4567-e89b-12d3-a456-426614174456',
          origin_iata: 'BSB',
          destination_iata: 'GIG',
          departure_datetime: '2025-07-01T09:30:00.000Z',
          arrival_datetime: '2025-07-01T12:05:00.000Z',
          frequency: [1, 2, 3, 4, 5],
          created_at: '2025-07-01T10:00:00.000Z',
          updated_at: '2025-07-01T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  async findAll(@Query() query: FlightQueryDto): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findAll(query);
    return flights.map((flight) => FlightResponseDto.fromEntity(flight));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flight by ID' })
  @ApiParam({
    name: 'id',
    description: 'Flight UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Flight retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        flight_number: 'LA3456',
        airline_id: '456e4567-e89b-12d3-a456-426614174456',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T12:05:00.000Z',
        frequency: [1, 2, 3, 4, 5],
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async findById(@Param('id') id: string): Promise<FlightResponseDto> {
    const flight = await this.flightsService.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return FlightResponseDto.fromEntity(flight);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Flight updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        flight_number: 'LA3456',
        airline_id: '456e4567-e89b-12d3-a456-426614174456',
        origin_iata: 'BSB',
        destination_iata: 'CGH',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T10:30:00.000Z',
        frequency: [1, 2, 3, 4, 5, 6],
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['origin_iata must be a valid IATA code'],
        error: 'Bad Request',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.update(id, updateFlightDto);
    return FlightResponseDto.fromEntity(flight);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Flight deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.flightsService.delete(id);
  }

  @Post(':id/recovery')
  @ApiOperation({ summary: 'Recover a deleted flight' })
  @ApiParam({
    name: 'id',
    description: 'Flight UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Flight recovered successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        flight_number: 'LA3456',
        airline_id: '456e4567-e89b-12d3-a456-426614174456',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T12:05:00.000Z',
        frequency: [1, 2, 3, 4, 5],
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T12:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  async recovery(@Param('id') id: string): Promise<FlightResponseDto> {
    const flight = await this.flightsService.recovery(id);
    return FlightResponseDto.fromEntity(flight);
  }
}
