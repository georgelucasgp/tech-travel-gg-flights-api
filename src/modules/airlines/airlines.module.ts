import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { AirlinesController } from './presentation/airlines.controller';
import { AirlinesService } from './application/airlines.service';
import { AirlineFactory } from './application/airline.factory';
import { AirlinesPrismaRepository } from './infrastructure/airlines.prisma.repository';

const AIRLINE_REPOSITORY_TOKEN = 'IAirlineRepository';

@Module({
  imports: [PrismaModule],
  controllers: [AirlinesController],
  providers: [
    AirlinesService,
    AirlineFactory,
    {
      provide: AIRLINE_REPOSITORY_TOKEN,
      useClass: AirlinesPrismaRepository,
    },
  ],
  exports: [AirlinesService, AIRLINE_REPOSITORY_TOKEN],
})
export class AirlinesModule {}
