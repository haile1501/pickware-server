import { Module } from '@nestjs/common';
import { AlgorithmController } from './controllers/algorithm.controller';
import { AlgorithmService } from './services/algorithm.service';

@Module({
  controllers: [AlgorithmController],
  providers: [AlgorithmService],
})
export class AlgorithmModule {}
