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
  ) {
    this.provider = new providers.InfuraProvider(
      'goerli',
      '3a2b126791f9443b86942c283bd16b32',
    );
    this.wallet = new Wallet(
      '77fa4fca186aae264a7bfdef42887946f6179bc5ab39c5a3e227e8a73380b377',
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
      .createQueryBuilder('select posts by address')
      .where('user_address = :address', { address })
      .where('token_id is NOT NULL')
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1))
      .getMany();
    return posts;
  }

  async uploadPost(
    userAddress: string,
    title: string,
    content: string,
  ): Promise<Post | null> {
    const newPost = new Post();
    newPost.userAddress = userAddress;
    newPost.title = title;
    newPost.content = content;
    newPost.contract = this.contractAddress;
    const post = await this.postsRepository.save(newPost);
    console.log('post created', post.id);

    // TODO: set uri correctly
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
