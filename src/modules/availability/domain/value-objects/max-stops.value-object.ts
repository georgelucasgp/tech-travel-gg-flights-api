export class MaxStops {
  private readonly value: number;

  constructor(value?: number) {
    this.value = this.validate(value);
  }

  private validate(value?: number): number {
    // Se não especificado, permite qualquer número de paradas
    if (value === undefined || value === null) {
      return Infinity;
    }

    if (!Number.isInteger(value) || value < 0) {
      throw new Error('Max stops must be a non-negative integer');
    }

    if (value > 3) {
      throw new Error('Max stops cannot exceed 3');
    }

    return value;
  }

  getValue(): number {
    return this.value;
  }

  isUnlimited(): boolean {
    return this.value === Infinity;
  }

  equals(other: MaxStops): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.isUnlimited() ? 'unlimited' : this.value.toString();
  }
}
