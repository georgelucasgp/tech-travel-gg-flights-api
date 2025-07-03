export class SearchDate {
  private readonly value: Date;

  constructor(value: string | Date) {
    this.value = this.parseAndValidate(value);
  }

  private parseAndValidate(value: string | Date): Date {
    let date: Date;

    if (typeof value === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('Search date must be in YYYY-MM-DD format');
      }
      date = new Date(value + 'T00:00:00.000Z');
    } else if (value instanceof Date) {
      date = new Date(value);
    } else {
      throw new Error('Search date must be a string or Date');
    }

    if (isNaN(date.getTime())) {
      throw new Error('Invalid search date');
    }

    const today = new Date();
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    if (dateOnly < todayOnly) {
      throw new Error('Search date cannot be in the past');
    }

    return date;
  }

  getValue(): Date {
    return new Date(this.value);
  }

  getDateString(): string {
    return this.value.toISOString().split('T')[0];
  }

  equals(other: SearchDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.getDateString();
  }
}
