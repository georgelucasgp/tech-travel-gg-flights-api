import { UserName } from './user-name.value-object';

describe('UserName', () => {
  it('should create with a valid name', () => {
    const name = 'John Doe';
    const userName = new UserName(name);
    expect(userName.getValue()).toBe(name);
  });

  it('should throw for empty or too short name', () => {
    expect(() => new UserName('')).toThrow();
    expect(() => new UserName('A')).toThrow();
  });

  it('should throw for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => new UserName(longName)).toThrow();
  });

  it('should throw for leading or trailing spaces', () => {
    expect(() => new UserName(' John')).toThrow();
    expect(() => new UserName('John ')).toThrow();
  });

  it('should compare equality correctly', () => {
    const name = 'John Doe';
    const n1 = new UserName(name);
    const n2 = new UserName(name);
    const n3 = new UserName('Jane');
    expect(n1.equals(n2)).toBe(true);
    expect(n1.equals(n3)).toBe(false);
  });
});
