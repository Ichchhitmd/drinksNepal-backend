import mongoose from "mongoose";

const VolumeVariationSchema = new mongoose.Schema(
  {
    id: { type: String, required: false },
    volume: { type: String, required: true },
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    type: { type: String },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isFeatured: { type: Boolean, default: 0 },
    visibilityInCatalog: { type: String, default: "visible" },
    shortDescription: { type: String },
    description: { type: String },
    dateSalePriceStarts: { type: String },
    dateSalePriceEnds: { type: String },
    taxStatus: { type: String },
    taxClass: { type: String },
    inStock: { type: Boolean },
    stock: { type: Number },
    lowStockAmount: { type: String },
    soldIndividually: { type: Boolean, default: 0 },
    weight: { type: String },
    length: { type: String },
    width: { type: String },
    height: { type: String },
    purchaseNote: { type: String },
    salePrice: { type: Number },
    regularPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: { type: String },
    shippingClass: { type: String },
    images: [{ type: String }],
    downloadLimit: { type: String },
    downloadExpiryDays: { type: String },
    parent: { type: String },
    groupedProducts: { type: String },
    upsells: { type: String },
    crossSells: { type: String },
    externalUrl: { type: String },
    buttonText: { type: String },
    totalSales: { type: Number, default: 0 },
    details: {
      volume: [VolumeVariationSchema],
      country: { type: String },
      age: { type: String },
      abv: { type: String },
      source: { type: String },
      closure: { type: String },
      packaging: { type: String },
      colour: { type: String },
      flavour: { type: String },
      grapeVarieties: { type: String },
    },
  },
  { timestamps: true }
);

ProductSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  tags: "text",
  "details.country": "text",
  "details.flavour": "text",
});

export const Product = mongoose.model("Product", ProductSchema);
