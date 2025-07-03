import { UserId, UserName, UserEmail } from '../value-objects';

export interface UserProps {
  id: UserId;
  name: UserName;
  email: UserEmail;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User {
  constructor(
    private readonly _id: UserId,
    private readonly _name: UserName,
    private readonly _email: UserEmail,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null,
  ) {}

  static create(props: UserProps): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  get id(): UserId {
    return this._id;
  }

  get name(): UserName {
    return this._name;
  }

  get email(): UserEmail {
    return this._email;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  update(): void {
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }
}
