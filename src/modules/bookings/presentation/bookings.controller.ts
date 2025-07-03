import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from '../application/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
        created_at: '2025-07-01T10:00:00Z',
        updated_at: '2025-07-01T10:00:00Z',
        itinerary: {
          id: '150',
          origin_iata: 'BSB',
          destination_iata: 'GIG',
          departure_datetime: '2025-07-01T09:30:00Z',
          arrival_datetime: '2025-07-01T12:05:00Z',
          total_duration_minutes: 155,
          stops: 1,
          flights: [],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid itinerary ID' })
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
  @ApiResponse({ status: 204, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bookingsService.cancel(id);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get all bookings for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User bookings retrieved successfully',
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findByUserId(userId);
    return bookings.map((booking) => BookingResponseDto.fromEntity(booking));
  }
}
