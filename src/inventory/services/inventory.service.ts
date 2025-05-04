import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CartonRepository } from '../repositories/carton.repository';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartonRepository: CartonRepository,
  ) {}
}
