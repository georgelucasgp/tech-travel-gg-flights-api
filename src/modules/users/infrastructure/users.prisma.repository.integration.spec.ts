import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { UsersPrismaRepository } from './users.prisma.repository';
import { IntegrationTestHelper } from '../../../../test/helpers/integration-test.helper';
import { UserFactory } from '../application/user.factory';
import { User } from '../domain/entities/user.entity';

describe('UsersPrismaRepository (Integration)', () => {
  let repository: UsersPrismaRepository;
  let prisma: PrismaService;
  let helper: IntegrationTestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersPrismaRepository, PrismaService],
    }).compile();

    repository = module.get<UsersPrismaRepository>(UsersPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    helper = IntegrationTestHelper.getInstance(prisma);
    await helper.setup();
  });

  beforeEach(async () => {
    await helper.cleanup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  const getValidUserProps = (
    id?: string,
    name = 'John Doe',
    email = 'john@example.com',
  ) => ({
    id,
    name,
    email,
  });

  describe('create()', () => {
    it('should create a user successfully', async () => {
      const userEntity = UserFactory.create(
        getValidUserProps(undefined, 'Alice', 'alice@example.com'),
      );
      const createdUser = await repository.create(userEntity);
      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.name.getValue()).toBe('Alice');
      expect(createdUser.email.getValue()).toBe('alice@example.com');
      const savedUser = await prisma.user.findUnique({
        where: { id: createdUser.id.getValue() },
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe('Alice');
      expect(savedUser?.email).toBe('alice@example.com');
    });
  });

  describe('findById()', () => {
    it('should find user by id', async () => {
      const userEntity = UserFactory.create(
        getValidUserProps(undefined, 'Bob', 'bob@example.com'),
      );
      await repository.create(userEntity);
      const foundUser = await repository.findById(userEntity.id.getValue());
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.name.getValue()).toBe('Bob');
      expect(foundUser?.email.getValue()).toBe('bob@example.com');
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      const user1 = UserFactory.create(
        getValidUserProps(undefined, 'User1', 'user1@example.com'),
      );
      const user2 = UserFactory.create(
        getValidUserProps(undefined, 'User2', 'user2@example.com'),
      );

      await repository.create(user1);
      await repository.create(user2);
      const users = await repository.findAll();
      expect(users.length).toBe(2);
      const emails = users.map((u) => u.email.getValue());

      expect(emails).toContain('user1@example.com');
      expect(emails).toContain('user2@example.com');
    });
  });

  describe('update()', () => {
    it('should update user name and email', async () => {
      const userEntity = UserFactory.create(
        getValidUserProps(undefined, 'Charlie', 'charlie@example.com'),
      );
      const createdUser = await repository.create(userEntity);
      const updatedUser = UserFactory.create({
        id: createdUser.id.getValue(),
        name: 'Charlie Updated',
        email: 'charlie.updated@example.com',
        createdAt: createdUser.createdAt,
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await repository.update(updatedUser);
      expect(result.name.getValue()).toBe('Charlie Updated');
      expect(result.email.getValue()).toBe('charlie.updated@example.com');

      const savedUser = await prisma.user.findUnique({
        where: { id: createdUser.id.getValue() },
      });

      expect(savedUser?.name).toBe('Charlie Updated');
      expect(savedUser?.email).toBe('charlie.updated@example.com');
    });
  });

  describe('delete()', () => {
    it('should soft delete user', async () => {
      const userEntity = UserFactory.create(
        getValidUserProps(undefined, 'Dave', 'dave@example.com'),
      );
      const createdUser = await repository.create(userEntity);
      await repository.delete(createdUser.id.getValue());

      const found = await repository.findById(createdUser.id.getValue());
      expect(found).not.toBeNull();
      expect(found?.deletedAt).not.toBeNull();
      const deletedUser = await prisma.user.findUnique({
        where: { id: createdUser.id.getValue() },
      });
      expect(deletedUser?.deletedAt).not.toBeNull();
    });
  });

  describe('recovery()', () => {
    it('should recover a soft deleted user', async () => {
      const userEntity = UserFactory.create(
        getValidUserProps(undefined, 'Eve', 'eve@example.com'),
      );
      const createdUser = await repository.create(userEntity);
      await repository.delete(createdUser.id.getValue());
      const recovered = await repository.recovery(createdUser.id.getValue());

      expect(recovered).toBeInstanceOf(User);
      expect(recovered.deletedAt).toBeNull();

      const savedUser = await prisma.user.findUnique({
        where: { id: createdUser.id.getValue() },
      });

      expect(savedUser?.deletedAt).toBeNull();
    });
  });
});
