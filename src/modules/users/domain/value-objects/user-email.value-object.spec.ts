import { UserEmail } from './user-email.value-object';

describe('UserEmail', () => {
  it('should create with a valid email', () => {
    const email = 'test@example.com';
    const userEmail = new UserEmail(email);
    expect(userEmail.getValue()).toBe(email);
  });

  it('should throw for empty email', () => {
    expect(() => new UserEmail('')).toThrow();
  });

  it('should throw for invalid format', () => {
    expect(() => new UserEmail('invalid')).toThrow();
    expect(() => new UserEmail('a@b')).toThrow();
    expect(() => new UserEmail('a@b.')).toThrow();
    expect(() => new UserEmail('a@.com')).toThrow();
    expect(() => new UserEmail('a@b@c.com')).toThrow();
  });

  it('should throw for too long email', () => {
    const longEmail = 'a'.repeat(245) + '@example.com';
    expect(() => new UserEmail(longEmail)).toThrow();
  });

  it('should compare equality ignoring case', () => {
    const e1 = new UserEmail('test@example.com');
    const e2 = new UserEmail('TEST@EXAMPLE.COM');
    const e3 = new UserEmail('other@example.com');
    expect(e1.equals(e2)).toBe(true);
    expect(e1.equals(e3)).toBe(false);
  });
});
