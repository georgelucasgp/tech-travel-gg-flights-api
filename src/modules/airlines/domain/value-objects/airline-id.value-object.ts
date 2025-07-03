import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validate as uuidValidate } from 'uuid';

export class AirlineId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('Airline ID must be a valid UUID');
    }
  }

  static create(value?: string): AirlineId {
    if (arguments.length === 0) {
      return new AirlineId(randomUUID());
    }
    return new AirlineId(value!);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirlineId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
