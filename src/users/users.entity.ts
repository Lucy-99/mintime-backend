import { Post } from 'src/posts/posts.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users', schema: 'mintime' })
export class User {
  @PrimaryColumn({ type: 'char', length: 42, name: 'address' })
  address: string;

  @Column('varchar', { length: 10, name: 'nickname' })
  nickname: string;

  @Column('int', { name: 'nonce' })
  nonce: number;

  @Column('varchar', { name: 'avatar', length: 512, nullable: true })
  avatar: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
