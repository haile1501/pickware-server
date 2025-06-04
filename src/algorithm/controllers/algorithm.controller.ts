import { Controller, Get } from '@nestjs/common';
import { AlgorithmService } from '../services/algorithm.service';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private readonly algorithmService: AlgorithmService) {}

  @Get('generate-preview')
  generatePreview() {}
}
