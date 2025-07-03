import { Module } from '@nestjs/common';
import { AirportsService } from './application/airports.service';
import { AirportsController } from './presentation/airports.controller';
import { AirportsPrismaRepository } from './infrastructure/airports.prisma.repository';

@Module({
  controllers: [AirportsController],
  providers: [
    AirportsService,
    {
      provide: 'IAirportRepository',
      useClass: AirportsPrismaRepository,
    },
  ],
  exports: [
    AirportsService,
    {
      provide: 'IAirportRepository',
      useClass: AirportsPrismaRepository,
    },
  ],
})
export class AirportsModule {}
