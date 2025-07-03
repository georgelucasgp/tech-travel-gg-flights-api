import { BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { randomUUID } from 'crypto';

export class BookingId {
  constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new BadRequestException('Booking ID must be a valid UUID');
    }
  }

  static create(value?: string): BookingId {
    if (arguments.length === 0) {
      return new BookingId(randomUUID());
    }
    return new BookingId(value!);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: BookingId): boolean {
    return this.value === other.value;
  }
}
