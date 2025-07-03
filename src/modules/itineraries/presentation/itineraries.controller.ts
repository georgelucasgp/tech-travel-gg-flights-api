import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ItinerariesService } from '../application/itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryResponseDto } from './dto/itinerary-response.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Itineraries')
@Controller({ path: 'itineraries', version: '1' })
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new itinerary',
    description:
      'Creates an itinerary from a sequence of flights. The API validates that the flight sequence is coherent (route, temporal, and connection validations) before creating the itinerary.',
  })
  @ApiBody({
    description: 'Flight IDs to create an itinerary',
    type: CreateItineraryDto,
    examples: {
      'Direct flight': {
        summary: 'Create itinerary with a single direct flight',
        value: {
          flight_ids: ['123e4567-e89b-12d3-a456-426614174000'],
        },
      },
      'Connection flight': {
        summary: 'Create itinerary with one connection',
        value: {
          flight_ids: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Itinerary created successfully - Flight sequence is valid',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T12:05:00.000Z',
        total_duration_minutes: 155,
        stops: 1,
        flights: [
          {
            id: '10',
            flight_number: 'LA3456',
            airline_id: '456e4567-e89b-12d3-a456-426614174456',
            origin_iata: 'BSB',
            destination_iata: 'CGH',
            departure_datetime: '2025-07-01T09:30:00.000Z',
            arrival_datetime: '2025-07-01T10:30:00.000Z',
            frequency: [1, 2, 3, 4, 5],
          },
          {
            id: '25',
            flight_number: 'LA7890',
            airline_id: '456e4567-e89b-12d3-a456-426614174456',
            origin_iata: 'CGH',
            destination_iata: 'GIG',
            departure_datetime: '2025-07-01T11:15:00.000Z',
            arrival_datetime: '2025-07-01T12:05:00.000Z',
            frequency: [1, 2, 3, 4, 5],
          },
        ],
      },
    },
  })
  async create(
    @Body() createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itinerariesService.create({
      flight_ids: createItineraryDto.flight_ids,
    });
    return ItineraryResponseDto.fromEntity(itinerary);
  }

  @Get()
  @ApiOperation({ summary: 'Get all itineraries' })
  @ApiResponse({
    status: 200,
    description: 'Itineraries retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          origin_iata: 'BSB',
          destination_iata: 'GIG',
          departure_datetime: '2025-07-01T09:30:00.000Z',
          arrival_datetime: '2025-07-01T12:05:00.000Z',
          total_duration_minutes: 155,
          stops: 1,
          flights: [
            {
              id: '10',
              flight_number: 'LA3456',
              airline_id: '456e4567-e89b-12d3-a456-426614174456',
              origin_iata: 'BSB',
              destination_iata: 'CGH',
              departure_datetime: '2025-07-01T09:30:00.000Z',
              arrival_datetime: '2025-07-01T10:30:00.000Z',
              frequency: [1, 2, 3, 4, 5],
            },
            {
              id: '25',
              flight_number: 'LA7890',
              airline_id: '456e4567-e89b-12d3-a456-426614174456',
              origin_iata: 'CGH',
              destination_iata: 'GIG',
              departure_datetime: '2025-07-01T11:15:00.000Z',
              arrival_datetime: '2025-07-01T12:05:00.000Z',
              frequency: [1, 2, 3, 4, 5],
            },
          ],
        },
      ],
    },
  })
  async findAll(): Promise<ItineraryResponseDto[]> {
    const itineraries = await this.itinerariesService.findAll();
    return itineraries.map((itinerary) =>
      ItineraryResponseDto.fromEntity(itinerary),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an itinerary by ID' })
  @ApiParam({
    name: 'id',
    description: 'Itinerary UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerary retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00.000Z',
        arrival_datetime: '2025-07-01T12:05:00.000Z',
        total_duration_minutes: 155,
        stops: 1,
        flights: [
          {
            id: '10',
            flight_number: 'LA3456',
            airline_id: '456e4567-e89b-12d3-a456-426614174456',
            origin_iata: 'BSB',
            destination_iata: 'CGH',
            departure_datetime: '2025-07-01T09:30:00.000Z',
            arrival_datetime: '2025-07-01T10:30:00.000Z',
            frequency: [1, 2, 3, 4, 5],
          },
          {
            id: '25',
            flight_number: 'LA7890',
            airline_id: '456e4567-e89b-12d3-a456-426614174456',
            origin_iata: 'CGH',
            destination_iata: 'GIG',
            departure_datetime: '2025-07-01T11:15:00.000Z',
            arrival_datetime: '2025-07-01T12:05:00.000Z',
            frequency: [1, 2, 3, 4, 5],
          },
        ],
      },
    },
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itinerariesService.findById(id);
    return ItineraryResponseDto.fromEntity(itinerary);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an itinerary' })
  @ApiParam({
    name: 'id',
    description: 'Itinerary UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Itinerary deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.itinerariesService.delete(id);
  }
}
