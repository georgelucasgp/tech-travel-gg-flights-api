import { Module } from '@nestjs/common';
import { AvailabilityService } from './application/availability.service';
import { AvailabilityController } from './presentation/availability.controller';
import { AvailabilityRepository } from './infrastructure/availability.repository';
import { FlightsModule } from '../flights/flights.module';
import { ItinerariesModule } from '../itineraries/itineraries.module';

@Module({
  imports: [FlightsModule, ItinerariesModule],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    {
      provide: 'IAvailabilityRepository',
      useClass: AvailabilityRepository,
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
