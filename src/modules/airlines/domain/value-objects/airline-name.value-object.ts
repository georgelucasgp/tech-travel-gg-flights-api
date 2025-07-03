import { BadRequestException } from '@nestjs/common';

export class AirlineName {
  constructor(private readonly value: string) {
    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  private validate(): void {
    if (!this.value || this.value.length < 2) {
      throw new BadRequestException(
        'Airline name must have at least 2 characters',
      );
    }

    if (this.value.length > 100) {
      throw new BadRequestException(
        'Airline name cannot exceed 100 characters',
      );
    }
  }

  equals(other: AirlineName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
