import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findByAddress(address: string) {
    return this.usersRepository.findOne({ where: { address } });
  }

  async create(address: string) {
    if (address.length != 42)
      throw new BadRequestException('address length must be 42');
    const nonce = Math.floor(Math.random() * 1000000);
    const user = await this.usersRepository.save({
      address,
      nickname: address.substring(0, 10),
      nonce,
    });
    return user;
  }

  async getNonceByAddress(address: string) {
    const user = await this.findByAddress(address);
    return user?.nonce || null;
  }
}
