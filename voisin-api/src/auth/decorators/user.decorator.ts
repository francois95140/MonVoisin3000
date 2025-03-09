import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

export interface UserPayload {
  id: string;
  role: UserRole;
}

export const GetUser = createParamDecorator(
  (prop: string | undefined, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();

    if (prop) {
      return request.user[prop];
    }

    return request.user;
  },
);
