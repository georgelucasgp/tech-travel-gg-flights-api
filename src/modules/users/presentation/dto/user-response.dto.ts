import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id.getValue(),
      name: user.name.getValue(),
      email: user.email.getValue(),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      deleted_at: user.deletedAt,
    };
  }
}
