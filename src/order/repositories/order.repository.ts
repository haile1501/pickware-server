import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDoc } from '../schemas/order.schema';
import { OrderDto, SetupOrdersDto } from '../dtos/setup-orders.dto';
import { OrderStatusEnum } from '../constants/order-status.enum';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDoc>,
  ) {}

  public async findPaginatedBySku(page: number, size: number): Promise<any[]> {
    const skip = (page - 1) * size;
    const orders = await this.orderModel.find().skip(skip).limit(size);

    // Collect all SKUs from all orderlines
    const skus = orders.flatMap((order) =>
      order.orderlines.map((ol) => ol.sku),
    );

    // Fetch all products with those SKUs
    const products = await this.orderModel.db
      .collection('products')
      .find({ sku: { $in: skus } })
      .toArray();

    // Map SKU to product
    const skuMap = new Map(products.map((p) => [p.sku, p]));

    // Attach product by SKU
    return orders.map((order) => {
      order.orderlines = order.orderlines.map((orderline) => ({
        ...orderline,
        product: skuMap.get(orderline.sku),
      }));
      return order.toJSON();
    });
  }

  public async countAll() {
    return this.orderModel.countDocuments();
  }

  public clearAll() {
    return this.orderModel.deleteMany();
  }

  public getPendingOrdersBeforeEndTime(endTime: Date) {
    return this.orderModel.find({
      status: OrderStatusEnum.Pending,
      arrivalTime: { $lte: new Date(endTime) },
    });
  }

  public getOrdersBetweenStartEndWithProducts(startTime: Date, endTime: Date) {
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

  public createOrder(order: OrderDto) {
    return this.orderModel.insertOne(order);
  }

  public fulfillOrders(waveId: string) {
    return this.orderModel.updateMany(
      { waveId },
      { status: OrderStatusEnum.Fulfilled },
    );
  }

  public getOrders() {
    return this.orderModel.find();
  }

  public async uploadOrders(orders: OrderDto[]) {
    await this.orderModel.deleteMany();
    return await this.orderModel.insertMany(orders);
  }
}
