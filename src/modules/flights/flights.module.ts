import { Module } from '@nestjs/common';
import { FlightsService } from './application/flights.service';
import { FlightsController } from './presentation/flights.controller';
import { FlightsPrismaRepository } from './infrastructure/flights.prisma.repository';
import { AirportsModule } from '../airports/airports.module';
import { AirlinesModule } from '../airlines/airlines.module';

@Module({
  imports: [AirportsModule, AirlinesModule],
  controllers: [FlightsController],
  providers: [
    FlightsService,
    {
      provide: 'IFlightRepository',
      useClass: FlightsPrismaRepository,
    },
  ],
  exports: [
    FlightsService,
    {
      provide: 'IFlightRepository',
      useClass: FlightsPrismaRepository,
    },
  ],
})
export class FlightsModule {}
