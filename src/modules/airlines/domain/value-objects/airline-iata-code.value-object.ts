import { BadRequestException } from '@nestjs/common';

export class AirlineIataCode {
  constructor(private readonly value: string) {
    if (!this.value || this.value.length !== 2) {
      throw new BadRequestException(
        'IATA code must be exactly 2 uppercase letters or digits',
      );
    }

    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  private validate(): void {
    const iataRegex = /^[A-Z0-9]{2}$/;

    if (!iataRegex.test(this.value)) {
      throw new BadRequestException(
        'IATA code must be exactly 2 uppercase letters or digits',
      );
    }
  }

  equals(other: AirlineIataCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
