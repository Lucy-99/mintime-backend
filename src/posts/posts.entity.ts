import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'posts', schema: 'mintime' })
export class Post {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column('char', { name: 'user_address', length: 42 })
  userAddress: string;

  @ManyToOne(() => User, (user) => user.posts, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_address', referencedColumnName: 'address' }])
  user: User;

  @Column('varchar', { name: 'title', length: 32 })
  title: string;

  @Column('text', { name: 'content' })
  content: string;

  @Column('char', { length: 42, name: 'contract', nullable: true })
  contract: string;

  @Column('varchar', { name: 'token_id', nullable: true, length: 66 })
  tokenId: string;

  @Column('varchar', { name: 'image', length: 512, nullable: true })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
