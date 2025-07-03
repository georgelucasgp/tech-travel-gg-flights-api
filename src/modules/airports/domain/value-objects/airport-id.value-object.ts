import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validate as uuidValidate } from 'uuid';

export class AirportId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('Airport ID must be a valid UUID');
    }
  }

  static create(value?: string): AirportId {
    if (arguments.length === 0) {
      return new AirportId(randomUUID());
    }
    return new AirportId(value!);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirportId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
