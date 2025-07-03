import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { FlightsModule } from './modules/flights/flights.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AirlinesModule } from './modules/airlines/airlines.module';
import { AirportsModule } from './modules/airports/airports.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FlightsModule,
    ItinerariesModule,
    BookingsModule,
    AvailabilityModule,
    AirlinesModule,
    AirportsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
