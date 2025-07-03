import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validate as uuidValidate } from 'uuid';

export class UserId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('User ID must be a valid UUID');
    }
  }

  static create(value?: string): UserId {
    if (arguments.length === 0) {
      return new UserId(randomUUID());
    }
    return new UserId(value!);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
