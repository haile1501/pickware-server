import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePickProgressDto {
  @IsString()
  @IsNotEmpty()
  vehicleCode: string;

  @IsString()
  @IsNotEmpty()
  cartonId: string;
}
