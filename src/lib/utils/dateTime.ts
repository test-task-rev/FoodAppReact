export class DateTimeUtility {
  static toISO8601(date: Date): string {
    return date.toISOString();
  }

  static fromISO8601(dateString: string): Date {
    return new Date(dateString);
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static dayRange(date: Date): { start: Date; end: Date } {
    return {
      start: this.startOfDay(date),
      end: this.endOfDay(date),
    };
  }

  static formatDateQuery(date: Date): string {
    return this.toISO8601(date);
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static isStale(lastFetched: Date | null, maxAgeMs: number = 60000): boolean {
    if (!lastFetched) return true;
    return Date.now() - lastFetched.getTime() > maxAgeMs;
  }
}
