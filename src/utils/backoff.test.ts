import { calculateBackoff } from './backoff';

describe('calculateBackoff', () => {
  it('returns 1000ms for attempt 1', () => {
    expect(calculateBackoff(1)).toBe(1000);
  });

  it('returns 2000ms for attempt 2', () => {
    expect(calculateBackoff(2)).toBe(2000);
  });

  it('returns 4000ms for attempt 3', () => {
    expect(calculateBackoff(3)).toBe(4000);
  });

  it('returns 8000ms for attempt 4', () => {
    expect(calculateBackoff(4)).toBe(8000);
  });

  it('returns 16000ms for attempt 5', () => {
    expect(calculateBackoff(5)).toBe(16000);
  });

  it('caps at 30000ms for high attempt numbers', () => {
    expect(calculateBackoff(16)).toBe(30000);
    expect(calculateBackoff(20)).toBe(30000);
    expect(calculateBackoff(100)).toBe(30000);
  });
});
