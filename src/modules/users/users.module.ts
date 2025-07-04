import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { UsersController } from './presentation/users.controller';
import { UsersService } from './application/users.service';
import { UserFactory } from './application/user.factory';
import { UsersPrismaRepository } from './infrastructure/users.prisma.repository';
import { BookingsModule } from '../bookings/bookings.module';

const USER_REPOSITORY_TOKEN = 'IUserRepository';

@Module({
  imports: [PrismaModule, BookingsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserFactory,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UsersPrismaRepository,
    },
  ],
  exports: [UsersService, USER_REPOSITORY_TOKEN],
})
export class UsersModule {}
