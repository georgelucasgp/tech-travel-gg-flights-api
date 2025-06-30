export class Frequency {
  private static readonly VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];
  constructor(private readonly days: number[]) {
    this.validate(days);
  }

  private validate(days: number[]): void {
    if (!Array.isArray(days) || days.length === 0) {
      throw new Error('Frequency must contain at least one day');
    }

    const uniqueDays = [...new Set(days)];
    if (uniqueDays.length !== days.length) {
      throw new Error('Frequency cannot contain duplicate days');
    }

    const invalidDays = days.filter(
      (day) => !Frequency.VALID_DAYS.includes(day),
    );
    if (invalidDays.length > 0) {
      throw new Error(
        `Invalid days: ${invalidDays.join(', ')}. Days must be 0-6 (Sunday=0, Saturday=6)`,
      );
    }
  }

  getValue(): number[] {
    return [...this.days].sort((a, b) => a - b);
  }

  equals(other: Frequency): boolean {
    const thisSorted = [...this.days].sort();
    const otherSorted = [...other.days].sort();

    return (
      thisSorted.length === otherSorted.length &&
      thisSorted.every((day, index) => day === otherSorted[index])
    );
  }

  includesDay(day: number): boolean {
    return this.days.includes(day);
  }

  toString(): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return this.days.map((day) => dayNames[day]).join(', ');
  }
}
