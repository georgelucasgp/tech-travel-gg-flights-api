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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Itineraries')
@Controller({ path: 'itineraries', version: '1' })
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new itinerary' })
  @ApiResponse({
    status: 201,
    description: 'Itinerary created successfully',
    schema: {
      example: {
        id: '150',
        origin_iata: 'BSB',
        destination_iata: 'GIG',
        departure_datetime: '2025-07-01T09:30:00Z',
        arrival_datetime: '2025-07-01T12:05:00Z',
        total_duration_minutes: 155,
        stops: 1,
        flights: [
          {
            id: '10',
            flight_number: 'LA3456',
            origin_iata: 'BSB',
            destination_iata: 'CGH',
            departure_datetime: '2025-07-01T09:30:00Z',
            arrival_datetime: '2025-07-01T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid flight sequence or flight not found',
  })
  async create(
    @Body() createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itinerariesService.create(createItineraryDto);
    return ItineraryResponseDto.fromEntity(itinerary);
  }

  @Get()
  @ApiOperation({ summary: 'Get all itineraries' })
  @ApiResponse({
    status: 200,
    description: 'Itineraries retrieved successfully',
  })
  async findAll(): Promise<ItineraryResponseDto[]> {
    const itineraries = await this.itinerariesService.findAll();
    return itineraries.map((itinerary) =>
      ItineraryResponseDto.fromEntity(itinerary),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an itinerary by ID' })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ItineraryResponseDto> {
    const itinerary = await this.itinerariesService.findById(id);
    return ItineraryResponseDto.fromEntity(itinerary);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an itinerary by ID' })
  @ApiResponse({ status: 204, description: 'Itinerary deleted successfully' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.itinerariesService.delete(id);
  }
}
