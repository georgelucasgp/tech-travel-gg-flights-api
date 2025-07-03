import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from '../application/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'ABC123',
        user_id: 'user-abc-123',
        status: 'PENDING',
        created_at: '2025-07-01T10:00:00.000Z',
        updated_at: '2025-07-01T10:00:00.000Z',
        itinerary: {
          id: '150',
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
      },
    },
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingsService.create({
      user_id: createBookingDto.user_id,
      itinerary_id: createBookingDto.itinerary_id,
    });
    return BookingResponseDto.fromEntity(booking);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Booking cancelled successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bookingsService.delete(id);
  }
}
