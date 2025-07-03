import { Module } from '@nestjs/common';
import { ItinerariesService } from './application/itineraries.service';
import { ItinerariesController } from './presentation/itineraries.controller';
import { ItinerariesPrismaRepository } from './infrastructure/itineraries.prisma.repository';
import { FlightsModule } from '../flights/flights.module';

@Module({
  imports: [FlightsModule],
  controllers: [ItinerariesController],
  providers: [
    ItinerariesService,
    {
      provide: 'IItineraryRepository',
      useClass: ItinerariesPrismaRepository,
    },
  ],
  exports: [
    ItinerariesService,
    {
      provide: 'IItineraryRepository',
      useClass: ItinerariesPrismaRepository,
    },
  ],
})
export class ItinerariesModule {}
