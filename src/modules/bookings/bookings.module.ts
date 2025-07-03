import { Module } from '@nestjs/common';
import { BookingsService } from './application/bookings.service';
import { BookingsController } from './presentation/bookings.controller';
import { BookingsPrismaRepository } from './infrastructure/bookings.prisma.repository';
import { ItinerariesModule } from '../itineraries/itineraries.module';

@Module({
  imports: [ItinerariesModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    {
      provide: 'IBookingRepository',
      useClass: BookingsPrismaRepository,
    },
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
