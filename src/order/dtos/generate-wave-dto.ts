import { IsNumber } from 'class-validator';

export class GenerateWaveDto {
  @IsNumber()
  startTime: Date;

  @IsNumber()
  endTime: Date;
}
