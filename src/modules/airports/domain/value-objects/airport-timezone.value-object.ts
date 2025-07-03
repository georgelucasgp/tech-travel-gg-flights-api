import { BadRequestException } from '@nestjs/common';

export class AirportTimezone {
  constructor(private readonly value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw new BadRequestException('Airport timezone cannot be empty');
    }

    this.value = trimmedValue;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirportTimezone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
