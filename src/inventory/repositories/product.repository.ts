import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDoc } from '../schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductModel } from '../models/create-product.model';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDoc>,
  ) {}

  public importProducts(products: CreateProductModel[]) {
    return this.productModel.insertMany(products);
  }

  public create(product: CreateProductModel) {
    return this.productModel.create(product);
  }

  public async findPaginated(page: number, size: number) {
    const skip = (page - 1) * size;
    return this.productModel.find().skip(skip).limit(size);
  }

  public async countAll() {
    return this.productModel.countDocuments();
  }

  public async clearAll() {
    return this.productModel.deleteMany();
  }
}
