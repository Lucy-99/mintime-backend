import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Contract,
  ContractReceipt,
  providers,
  Wallet,
  BigNumber,
} from 'ethers';
import { abi } from 'src/abi';
import { uploadFileURL } from 'src/multer.options';
import { User } from 'src/users/users.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { Post } from './posts.entity';

@Injectable()
export class PostsService {
  private wallet: Wallet;
  private provider: providers.InfuraProvider;
  private contractAddress: string;
  private contract: Contract;
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {
    this.provider = new providers.InfuraProvider(
      'goerli',
      '3a2b126791f9443b86942c283bd16b32',
    );
    this.wallet = new Wallet(
      'd75c2311d4dd391a3222963a71bae2dc0b7665f9687f51abfd293ad7104af46e',
      this.provider,
    );
    this.contractAddress = '0x4Dab3e08f8900e52F2Dc4bcd36BdA9BD9c6DF65C';
    this.contract = new Contract(this.contractAddress, abi, this.wallet);
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) throw new ForbiddenException('post not exist');
    return post;
  }

  async getPostsByUserAddress(address: string, page: number, limit: number) {
    const posts = await this.postsRepository
      .createQueryBuilder('posts')
      .where('user_address = :address', { address: address })
      .andWhere('token_id is NOT NULL')
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1))
      .getMany();
    const posts2 = posts.map((p) => {
      return {
        ...p,
        comments: [
          {
            id: 1,
            nickname: '댓글알바1',
            content: '와 너무 이뻐요! 이 사진 꼭 가지고 싶네요.',
          },
          {
            id: 2,
            nickname: '댓글알바2',
            content: '시험기간에 힐링 잘 하고 갑니다.',
          },
        ],
      };
    });
    return posts2;
  }

  async getRecentPosts(page: number, limit: number) {
    const posts = await this.postsRepository
      .createQueryBuilder('posts')
      .where('token_id is NOT NULL')
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1))
      .getMany();
    const addrs = {};
    posts.forEach((p) => {
      const addr = p.userAddress;
      addrs[addr] = '';
    });
    const users = await this.usersRepository
      .createQueryBuilder('users')
      .select(['users.address', 'users.nickname', 'users.avatar'])
      .where('address IN (:...addrs)', { addrs: [Object.keys(addrs)] })
      .getMany();
    users.forEach(
      (u) =>
        (addrs[u.address] = {
          nickname: u.nickname,
          avatar: u.avatar,
        }),
    );
    const posts2 = posts.map((p) => {
      return {
        ...p,
        likes: Math.floor(Math.random() * 30),
        nickname: addrs[p.userAddress].nickname,
        avatar: addrs[p.userAddress].avatar,
        comments: [
          {
            id: 1,
            nickname: '댓글알바1',
            content: '와 너무 이뻐요! 이 사진 꼭 가지고 싶네요.',
          },
          {
            id: 2,
            nickname: '댓글알바2',
            content: '시험기간에 힐링 잘 하고 갑니다.',
          },
        ],
      };
    });
    return posts2;
  }

  async uploadPost(
    userAddress: string,
    title: string,
    content: string,
    file: Express.Multer.File,
  ): Promise<Post | null> {
    const newPost = new Post();
    newPost.userAddress = userAddress;
    newPost.title = title;
    newPost.content = content;
    newPost.contract = this.contractAddress;
    newPost.image = uploadFileURL(file.filename);
    const post = await this.postsRepository.save(newPost);
    console.log('post created', post.id);

    const uri = 'http://localhost:3090/api/posts/' + post.id;
    const mintTx = await this.contract.mint(userAddress, uri);
    const receipt: ContractReceipt = await mintTx.wait();
    if (receipt.status === 1) {
      // success
      console.log('nft minted');
      for await (const e of receipt.events) {
        const tokenIdArg: BigNumber = e.args[2];
        const tokenId = tokenIdArg.toString();
        // TODO: update token with this id
        newPost.tokenId = tokenId;
        await this.postsRepository.update(post.id, newPost);
        console.log('post updated, tokenID:', tokenId);
      }
      return newPost;
    }
    // failed
    throw new InternalServerErrorException('failed to create post');
  }
}
