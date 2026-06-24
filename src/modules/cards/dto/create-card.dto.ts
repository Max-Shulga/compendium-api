import { IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  readonly title!: string;

  @IsString()
  readonly text!: string;

  @IsOptional()
  @IsString()
  readonly examples?: string;
}
