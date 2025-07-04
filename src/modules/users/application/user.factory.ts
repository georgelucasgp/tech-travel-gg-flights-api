import { Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { UserId, UserName, UserEmail } from '../domain/value-objects';

export type UserFactoryProps = {
  id?: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Injectable()
export class UserFactory {
  static create(props: UserFactoryProps): User {
    return User.create({
      id: props.id ? new UserId(props.id) : UserId.create(),
      name: new UserName(props.name),
      email: new UserEmail(props.email),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }
}
