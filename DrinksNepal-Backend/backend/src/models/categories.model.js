import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  isHome: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
});

export const homeCategoryData = [
  {
    id: "1",
    name: "Whiskey & Scotch",
    image: `/images/beer.png`,
    type: "category",
  },
  {
    id: "2",
    name: "Vodka",
    image: `/images/spirit.png`,
    type: "category",
  },
  {
    id: "3",
    name: "Rum",
    image: `/images/wine.png`,
    type: "category",
  },
  {
    id: "4",
    name: "Beer",
    image: `/images/beer.png`,
    type: "category",
  },
  {
    id: "5",
    name: "Domestic",
    image: `/images/premixed.png`,
    type: "source",
  },
  {
    id: "6",
    name: "Imported",
    image: `/images/tobaco.png`,
    type: "source",
  },
];

export const Category = mongoose.model("Category", categorySchema);
