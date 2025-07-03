import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { FlightsModule } from './modules/flights/flights.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AirlinesModule } from './modules/airlines/airlines.module';
import { AirportsModule } from './modules/airports/airports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FlightsModule,
    ItinerariesModule,
    BookingsModule,
    AirlinesModule,
    AirportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
