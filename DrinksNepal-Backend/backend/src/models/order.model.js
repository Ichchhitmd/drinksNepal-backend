import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "outfordelivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["cash", "fonepay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: {
          type: Number,
          required: true,
          default: function () {
            return this.product.details.price * this.quantity;
          },
        },
        volume: { type: String, required: true },
      },
    ],
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalAmount: { type: Number, required: true },
    tokenAmount: {
      type: Number,
      required: true,
      default: function () {
        return this.totalAmount * this.exchangeRate.rate;
      },
    },
    exchangeRate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRate",
      required: true,
      default: async function () {
        const activeRate = await mongoose
          .model("ExchangeRate")
          .findOne({ isActive: true });
        return activeRate ? activeRate._id : null;
      },
    },
    deliveryDurationInMinutes: { type: Number, required: false },
    deliveryDistanceInMeters: { type: Number, required: false },
  },
  { timestamps: true }
);

OrderSchema.statics.getUserPurchasedProducts = async function (userId, limit) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    // Group by product to avoid duplicates
    {
      $group: {
        _id: "$productDetails._id",
        productId: { $first: "$productDetails._id" },
        createdAt: { $first: "$createdAt" },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);
};

export const Order = mongoose.model("Order", OrderSchema);
