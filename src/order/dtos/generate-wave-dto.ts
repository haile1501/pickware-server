import { IsDateString, IsString } from 'class-validator';

export class GenerateWaveDto {
  @IsDateString()
  endTime: string;

  @IsString()
  algorithm: string;
}
