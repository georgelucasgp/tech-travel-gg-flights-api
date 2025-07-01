import { Module } from '@nestjs/common';
import { FlightsService } from './application/flights.service';
import { FlightsController } from './presentation/flights.controller';
import { FlightsPrismaRepository } from './infrastructure/flights.prisma.repository';

@Module({
  controllers: [FlightsController],
  providers: [
    FlightsService,
    {
      provide: 'IFlightRepository',
      useClass: FlightsPrismaRepository,
    },
  ],
  exports: [FlightsService],
})
export class FlightsModule {}
