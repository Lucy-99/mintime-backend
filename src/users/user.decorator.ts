import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IAuthenticatedUser {
  address: string;
  nickname: string;
  avatar: string;
}

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
