import { BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

export class FlightId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('Flight ID must be a valid UUID');
    }
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
