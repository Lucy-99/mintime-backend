import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { multerDiskOptions } from 'src/multer.options';
import { UserDecorator } from 'src/users/user.decorator';
import { JoinDto } from './dto/join.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
    return await this.usersService.findByAddress(user.address);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerDiskOptions))
  @Patch('profile')
  async updateProfile(
    @UserDecorator() user,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(updateProfileDto.nickname)
    return await this.usersService.updateProfile(
      user.address,
      updateProfileDto.nickname,
      file,
    );
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
