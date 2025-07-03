import { BadRequestException } from '@nestjs/common';

export class UserName {
  constructor(private readonly value: string) {
    if (!this.value || this.value.trim().length === 0) {
      throw new BadRequestException('User name cannot be empty');
    }

    if (this.value.length < 2 || this.value.length > 100) {
      throw new BadRequestException(
        'User name must be between 2 and 100 characters',
      );
    }

    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  private validate(): void {
    const trimmedValue = this.value.trim();
    if (trimmedValue.length !== this.value.length) {
      throw new BadRequestException(
        'User name cannot have leading or trailing spaces',
      );
    }
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
