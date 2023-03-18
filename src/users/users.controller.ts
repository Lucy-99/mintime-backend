import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UserDecorator } from 'src/users/user.decorator';
import { JoinDto } from './dto/join.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // @ApiResponse({
  //   status: 200,
  //   description: '성공'
  // })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@UserDecorator() user) {
    return user;
  }

  @Post('join')
  async join(@Body() joinDto: JoinDto) {
    return await this.usersService.create(joinDto.address);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Get(':address')
  async getUser(@Param('address') address: string) {
    const user = await this.usersService.findByAddress(address);
    return user;
  }

  @Get('nonce/:address')
  async getNonce(@Param('address') address: string) {
    const nonce = await this.usersService.getNonceByAddress(address);
    return { nonce };
  }
}
