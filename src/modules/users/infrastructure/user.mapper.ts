import type { User as PrismaUser } from '@prisma/client';
import { User } from '../domain/entities/user.entity';
import { UserId, UserName, UserEmail } from '../domain/value-objects';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.create({
      id: new UserId(prismaUser.id),
      name: new UserName(prismaUser.name),
      email: new UserEmail(prismaUser.email),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
    });
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id.getValue(),
      name: user.name.getValue(),
      email: user.email.getValue(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
