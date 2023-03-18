import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAuthenticatedUser, UserDecorator } from 'src/users/user.decorator';
import { GetUserPostsQuery } from './dto/get-user-posts.dto';
import { PostsService } from './posts.service';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
  @Post('')
  async uploadPost(@UserDecorator() user: IAuthenticatedUser) {
    const post = await this.postsService.uploadPost(
      user.address,
      'title',
      'content',
    );
    return { id: post.id };
  }
}
