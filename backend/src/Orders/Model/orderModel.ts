import { model, Schema, Document } from "mongoose";

export interface IOrder extends Document {
  date: Date;
  description: string;
  file: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model<IOrder>("Order", OrderSchema);
export default Order;
