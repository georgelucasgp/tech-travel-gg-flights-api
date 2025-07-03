import { BadRequestException } from '@nestjs/common';

export class AirportName {
  constructor(private readonly value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue || trimmedValue.length < 5) {
      throw new BadRequestException(
        'Airport name must have at least 5 characters',
      );
    }

    if (trimmedValue.length > 200) {
      throw new BadRequestException(
        'Airport name cannot exceed 200 characters',
      );
    }

    this.value = trimmedValue;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirportName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
