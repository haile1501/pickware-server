import { IsDateString } from 'class-validator';

export class GenerateWaveDto {
  @IsDateString()
  endTime: string;
}
