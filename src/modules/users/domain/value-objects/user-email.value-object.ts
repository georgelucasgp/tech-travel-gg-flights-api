import { BadRequestException } from '@nestjs/common';

export class UserEmail {
  constructor(private readonly value: string) {
    if (!this.value || this.value.trim().length === 0) {
      throw new BadRequestException('Email cannot be empty');
    }

    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.value)) {
      throw new BadRequestException('Invalid email format');
    }

    if (this.value.length > 254) {
      throw new BadRequestException('Email is too long');
    }
  }

  equals(other: UserEmail): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
