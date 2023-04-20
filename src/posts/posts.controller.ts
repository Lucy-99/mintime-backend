import {
  Bind,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { multerDiskOptions } from 'src/multer.options';
import { IAuthenticatedUser, UserDecorator } from 'src/users/user.decorator';
import { GetUserPostsQuery } from './dto/get-user-posts.dto';
import { UploadPostDto } from './dto/upload-post.dto';
import { PostsService } from './posts.service';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('recent')
  async getRecentPosts(@Query() getUserPostsQuery: GetUserPostsQuery) {
    const posts = await this.postsService.getRecentPosts(
      getUserPostsQuery.page,
      getUserPostsQuery.limit,
    );
    return { posts };
  }

  @Get(':id')
  async getPostById(@Param('id') id: number) {
    return await this.postsService.getPostById(id);
  }

  @Get('users/:address')
  async getUserPosts(
    @Param('address') address: string,
    @Query() getUserPostsQuery: GetUserPostsQuery,
  ) {
    const posts = await this.postsService.getPostsByUserAddress(
      address,
      getUserPostsQuery.page,
      getUserPostsQuery.limit,
    );
    return { posts };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerDiskOptions))
  @Post('')
  async uploadPost(
    @UserDecorator() user,
    @Body() uploadPostDto: UploadPostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const post = await this.postsService.uploadPost(
      user.address,
      uploadPostDto.title,
      uploadPostDto.content,
      file,
    );

    return { id: post.id };
  }

  @Get('image/:name')
  getImage(@Param('name') name: string, @Res() res) {
    const path = process.cwd() + '/uploads/' + name;
    const file = createReadStream(path);
    file.pipe(res);
  }
}
