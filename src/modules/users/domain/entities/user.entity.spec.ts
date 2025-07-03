import { User } from './user.entity';
import { UserFactory, UserFactoryProps } from '../../application/user.factory';
import { randomUUID } from 'crypto';

describe('User Entity', () => {
  const createUser = (params: Partial<UserFactoryProps> = {}): User => {
    return UserFactory.create({
      id: params.id || randomUUID(),
      name: params.name || 'John Doe',
      email: params.email || 'john@example.com',
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
      deletedAt: params.deletedAt || null,
    });
  };

  describe('create', () => {
    it('should create a user with all required properties', () => {
      const user = createUser();
      expect(user).toBeInstanceOf(User);
    });

    it('should create a user with valid data including ID', () => {
      const user = createUser({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane',
        email: 'jane@example.com',
      });
      expect(user.id.getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.name.getValue()).toBe('Jane');
      expect(user.email.getValue()).toBe('jane@example.com');
    });
  });

  describe('Business Logic Methods', () => {
    describe('update', () => {
      it('should update the updatedAt timestamp', () => {
        const user = createUser();
        const originalUpdatedAt = user.updatedAt;
        user.update();
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      });
    });

    describe('isDeleted', () => {
      it('should return false for non-deleted user', () => {
        const user = createUser();
        expect(user.isDeleted()).toBe(false);
      });
      it('should return true for deleted user', () => {
        const user = createUser({ deletedAt: new Date() });
        expect(user.isDeleted()).toBe(true);
      });
    });
  });
});
