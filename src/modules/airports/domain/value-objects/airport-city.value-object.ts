import { BadRequestException } from '@nestjs/common';

export class AirportCity {
  constructor(private readonly value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue || trimmedValue.length < 2) {
      throw new BadRequestException(
        'Airport city must have at least 2 characters',
      );
    }

    if (trimmedValue.length > 100) {
      throw new BadRequestException(
        'Airport city cannot exceed 100 characters',
      );
    }

    this.value = trimmedValue;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirportCity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
