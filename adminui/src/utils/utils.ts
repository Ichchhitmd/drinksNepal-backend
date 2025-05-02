import { Product } from "../types/types";

export const convertToCSV = (products: Product[]) => {
  // Define CSV headers
  const headers = [
    "ID",
    "SKU",
    "Name",
    "Description",
    "Short Description",
    "Category ID",
    "Category Name",
    "Category Parent",
    "Category Is Home",
    "Button Text",
    "Created At",
    "Cross Sells",
    "Sale Price Start Date",
    "Sale Price End Date",
    // Details
    "ABV",
    "Age",
    "Closure",
    "Colour",
    "Country",
    "Flavour",
    "Grape Varieties",
    "Packaging",
    "Source",
    // Additional fields
    "Download Expiry Days",
    "Download Limit",
    "External URL",
    "Grouped Products",
    "Height",
    "Stock",
    "Tags",
    "Type",
    "Is Featured",
    "In Stock",
    "Total Sales",
    "Volume Options",
  ];

  // Convert products to CSV rows
  const rows = products.map((product) => [
    product.id,
    product.sku,
    product.name,
    product.description,
    product.shortDescription,
    product.category._id,
    product.category.name,
    product.category.parent,
    product.category.isHome,
    product.createdAt,

    // Details
    product.details.abv,
    product.details.age,
    product.details.closure,
    product.details.colour,
    product.details.country,
    product.details.flavour,
    product.details.grapeVarieties,
    product.details.packaging,
    product.details.source,
    // Additional fields
    product.stock,
    product.tags,
    product.type,
    product.isFeatured,
    product.inStock,
    product.totalSales,
    // Volume options formatted as volume:regularPrice:salePrice:stock:inStock:isDefault
    product.details.volume
      .map(
        (v) =>
          `${v.volume}:${v.regularPrice}:${v.salePrice}:${v.stock}:${v.inStock}:${v.isDefault}`
      )
      .join("|"),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return "";
          // Convert boolean values to "Yes"/"No"
          if (typeof cell === "boolean") return cell ? "Yes" : "No";
          // Escape cells containing commas or quotes
          if (
            typeof cell === "string" &&
            (cell.includes(",") || cell.includes('"'))
          ) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
};
