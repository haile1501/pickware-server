import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class SetupVehiclesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  codes: string[];
}
