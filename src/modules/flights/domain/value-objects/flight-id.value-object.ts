import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validate as uuidValidate } from 'uuid';

export class FlightId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('Flight ID must be a valid UUID');
    }
  }

  static create(value?: string): FlightId {
    if (arguments.length === 0) {
      return new FlightId(randomUUID());
    }
    return new FlightId(value!);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FlightId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
