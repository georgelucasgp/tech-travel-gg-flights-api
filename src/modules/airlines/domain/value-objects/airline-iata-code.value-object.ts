export class AirlineIataCode {
  constructor(private readonly value: string) {
    if (!this.value || this.value.length !== 2) {
      throw new Error('IATA code must be exactly 2 uppercase letters');
    }

    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  private validate(): void {
    const iataRegex = /^[A-Z]{2}$/;

    if (!iataRegex.test(this.value)) {
      throw new Error('IATA code must be exactly 2 uppercase letters');
    }
  }

  equals(other: AirlineIataCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
