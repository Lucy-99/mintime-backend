import { IsString } from 'class-validator';

export class UploadPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
