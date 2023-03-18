import { IsString } from 'class-validator';

export class JoinDto {
  @IsString()
  address: string;
}
