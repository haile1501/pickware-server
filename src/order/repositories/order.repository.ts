import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDoc } from '../schemas/order.schema';
import { SetupOrdersDto } from '../dtos/setup-orders.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDoc>,
  ) {}

  public async findPaginated(page: number, size: number) {
    const skip = (page - 1) * size;

    return this.orderModel.find().skip(skip).limit(size);
  }

  public async countAll() {
    return this.orderModel.countDocuments();
  }

  public clearAll() {
    return this.orderModel.deleteMany();
  }

  public getOrdersBetweenStartEnd(startTime: Date, endTime: Date) {
    return this.orderModel.find({
      arrivalTime: {
        $gte: startTime,
        $lte: endTime,
      },
    });
  }

  public setupOrders(data: SetupOrdersDto) {
    return this.orderModel.insertMany(data.orders);
  }
}
