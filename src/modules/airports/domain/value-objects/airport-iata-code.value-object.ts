import { BadRequestException } from '@nestjs/common';

export class AirportIataCode {
  constructor(private readonly value: string) {
    const normalizedValue = value.toUpperCase().trim();
    const iataRegex = /^[A-Z]{3}$/;

    if (!iataRegex.test(normalizedValue)) {
      throw new BadRequestException(
        'IATA code must be exactly 3 uppercase letters',
      );
    }

    this.value = normalizedValue;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AirportIataCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
