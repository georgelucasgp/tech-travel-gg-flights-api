import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AvailabilityService } from '../application/availability.service';
import { AvailabilitySearchDto } from './dto/availability-search.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Availability')
@Controller({ path: 'availability', version: '1' })
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for available flight itineraries',
    description:
      'Find flight combinations (itineraries) that match the search criteria. This is the main search endpoint for finding round-trip or one-way flights with optional filters for airlines and maximum number of stops.',
  })
  @ApiBody({
    description: 'Search criteria for finding available flights',
    type: AvailabilitySearchDto,
    examples: {
      'One-way flight': {
        summary: 'Search for one-way flights',
        value: {
          origin: 'BSB',
          destination: 'GIG',
          departure_date: '2025-07-01',
          airlines: ['LA'],
          max_stops: 1,
        },
      },
      'Round-trip flight': {
        summary: 'Search for round-trip flights',
        value: {
          origin: 'BSB',
          destination: 'GIG',
          departure_date: '2025-07-01',
          return_date: '2025-07-10',
          airlines: ['LA', 'AZ'],
          max_stops: 1,
        },
      },
      'Direct flights only': {
        summary: 'Search for direct flights only',
        value: {
          origin: 'BSB',
          destination: 'GIG',
          departure_date: '2025-07-01',
          max_stops: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Available itineraries found successfully',
    schema: {
      example: {
        outbound_itineraries: [
          {
            itinerary_id: '101',
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
                origin_iata: 'BSB',
                destination_iata: 'CGH',
                departure_datetime: '2025-07-01T09:30:00.000Z',
                arrival_datetime: '2025-07-01T10:30:00.000Z',
              },
              {
                id: '25',
                flight_number: 'LA7890',
                origin_iata: 'CGH',
                destination_iata: 'GIG',
                departure_datetime: '2025-07-01T11:15:00.000Z',
                arrival_datetime: '2025-07-01T12:05:00.000Z',
              },
            ],
          },
          {
            itinerary_id: '102',
            origin_iata: 'BSB',
            destination_iata: 'GIG',
            departure_datetime: '2025-07-01T14:00:00.000Z',
            arrival_datetime: '2025-07-01T16:30:00.000Z',
            total_duration_minutes: 150,
            stops: 0,
            flights: [
              {
                id: '30',
                flight_number: 'LA1000',
                origin_iata: 'BSB',
                destination_iata: 'GIG',
                departure_datetime: '2025-07-01T14:00:00.000Z',
                arrival_datetime: '2025-07-01T16:30:00.000Z',
              },
            ],
          },
        ],
        inbound_itineraries: [
          {
            itinerary_id: '202',
            origin_iata: 'GIG',
            destination_iata: 'BSB',
            departure_datetime: '2025-07-10T14:00:00.000Z',
            arrival_datetime: '2025-07-10T16:00:00.000Z',
            total_duration_minutes: 120,
            stops: 0,
            flights: [
              {
                id: '40',
                flight_number: 'LA2000',
                origin_iata: 'GIG',
                destination_iata: 'BSB',
                departure_datetime: '2025-07-10T14:00:00.000Z',
                arrival_datetime: '2025-07-10T16:00:00.000Z',
              },
            ],
          },
        ],
      },
    },
  })
  async search(
    @Body() searchDto: AvailabilitySearchDto,
  ): Promise<AvailabilityResponseDto> {
    const result = await this.availabilityService.search(searchDto);
    return AvailabilityResponseDto.fromResult(
      result.outbound_itineraries,
      result.inbound_itineraries,
    );
  }
}
