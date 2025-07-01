import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { FlightsModule } from './modules/flights/flights.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FlightsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
