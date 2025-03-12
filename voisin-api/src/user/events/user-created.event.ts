
export class UserCreatedEvent {
    constructor(
      public readonly id: string,
      public readonly email: string,
      public readonly createdAt: Date,
      public readonly fullname: string
    ) {}
  }