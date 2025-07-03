import {
  BookingStatus,
  BookingStatusEnum,
} from './booking-status.value-object';
import { BadRequestException } from '@nestjs/common';

describe('BookingStatus', () => {
  it('should create pending status', () => {
    const status = BookingStatus.pending();
    expect(status.isPending()).toBe(true);
    expect(status.toString()).toBe('PENDING');
  });

  it('should create confirmed status', () => {
    const status = BookingStatus.confirmed();
    expect(status.isConfirmed()).toBe(true);
    expect(status.toString()).toBe('CONFIRMED');
  });

  it('should create cancelled status', () => {
    const status = BookingStatus.cancelled();
    expect(status.isCancelled()).toBe(true);
    expect(status.toString()).toBe('CANCELLED');
  });

  it('should compare equality', () => {
    const s1 = BookingStatus.pending();
    const s2 = BookingStatus.pending();
    const s3 = BookingStatus.cancelled();
    expect(s1.equals(s2)).toBe(true);
    expect(s1.equals(s3)).toBe(false);
  });

  it('should allow cancellation only if pending or confirmed', () => {
    expect(BookingStatus.pending().canBeCancelled()).toBe(true);
    expect(BookingStatus.confirmed().canBeCancelled()).toBe(true);
    expect(BookingStatus.cancelled().canBeCancelled()).toBe(false);
  });

  it('should throw for invalid status', () => {
    expect(() => new BookingStatus('INVALID' as BookingStatusEnum)).toThrow(
      BadRequestException,
    );
  });
});
