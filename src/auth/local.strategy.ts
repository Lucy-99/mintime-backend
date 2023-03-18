import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'address', passwordField: 'signature' });
  }

  async validate(address: string, signature: string): Promise<any> {
    const user = await this.authService.validateUser(address, signature);
    return user;
  }
}
