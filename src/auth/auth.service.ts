import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(address: string, signature: string) {
    const user = await this.usersService.findByAddress(address);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const recoveredAddress = ethers.utils.verifyMessage(
      user.nonce + '',
      signature,
    );
    if (recoveredAddress !== address) {
      throw new UnauthorizedException('Signature not matched');
    }
    const { nonce, ...result } = user;
    return result;
  }

  async login(user: any) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
