// seed.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cocofina";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  image: String,
  order: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const variantSchema = new mongoose.Schema({
  weight: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  stock: { type: Number, default: 10 }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [String],
  thumbnail: String,
  description: { short: String, long: String },
  variants: [variantSchema],
  usage: [String],
  highlights: [String],
  shelfLife: String,
  storageInstructions: String,
  delivery: String,
  stockStatus: { type: String, default: 'In Stock' },
  status: { type: String, default: 'active' },
  isComingSoon: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const categoriesData = [
  { name: "Organic Coconut Sugar", slug: "organic-coconut-sugar", description: "100% natural, unrefined organic coconut sugar.", order: 1 },
  { name: "Coconut Nectar Syrups", slug: "coconut-nectar-syrups", description: "Liquid sweeteners made from coconut sap.", order: 2 },
  { name: "Coconut Delicacies", slug: "coconut-delicacies", description: "Premium coconut spreads and treats.", order: 3 }
];

const productsData = [
  {
    name: "Cocofina Organic Coconut Sugar Classic",
    slug: "cocofina-organic-coconut-sugar-classic",
    description: {
      short: "Premium quality unrefined organic coconut sugar with a rich caramel note.",
      long: "Cocofina Organic Coconut Sugar is a natural sweetener made from the sap of coconut blossoms. It is unrefined, free from additives or chemicals, and offers a perfect 1:1 replacement for white refined sugar with a low Glycemic Index."
    },
    images: ["cocofinaproduct.png"],
    thumbnail: "cocofinaproduct.png",
    variants: [
      { weight: "250g", price: 180, oldPrice: 220, stock: 50 },
      { weight: "500g", price: 340, oldPrice: 399, stock: 40 },
      { weight: "1kg", price: 650, oldPrice: 750, stock: 25 }
    ],
    usage: [
      "Use in place of regular sugar for tea, coffee, and daily beverages.",
      "Perfect for baking cakes, cookies, and organic treats.",
      "Excellent for preparing traditional Indian sweets."
    ],
    highlights: [
      "100% Natural & Organic",
      "Low Glycemic Index",
      "Rich in iron, zinc, and calcium"
    ],
    shelfLife: "12 Months",
    storageInstructions: "Store in a cool, dry place in an airtight container.",
    delivery: "Ships within 24-48 hours. Delivered in 3-7 business days."
  },
  {
    name: "Cocofina Coconut Blossom Nectar",
    slug: "cocofina-coconut-blossom-nectar",
    description: {
      short: "Rich liquid sweetener made from coconut blossom sap, ideal for pancakes and waffles.",
      long: "Cocofina Blossom Nectar is a delicious liquid sweetener collected sustainably from organic coconut trees. With a smooth caramel texture and natural vitamins, it acts as a superior alternative to honey and maple syrup."
    },
    images: ["cocofinaproduct.png"],
    thumbnail: "cocofinaproduct.png",
    variants: [
      { weight: "200ml", price: 210, oldPrice: 250, stock: 30 },
      { weight: "500ml", price: 450, oldPrice: 520, stock: 15 }
    ],
    usage: [
      "Drizzle over pancakes, waffles, oatmeal, and breakfast bowls.",
      "Mix into smoothies or shakes for a rich flavor.",
      "Drizzle on fresh salads or fruit bowls."
    ],
    highlights: [
      "No artificial colors or flavors",
      "Slow-release energy source",
      "Eco-friendly and sustainably sourced"
    ],
    shelfLife: "18 Months",
    storageInstructions: "Store in a cool place, refrigerate after opening.",
    delivery: "Ships within 24-48 hours. Delivered in 3-7 business days."
  }
];

async function seed() {
  console.log("Connecting to Database:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("Cleared existing categories and products.");

  const createdCats = await Category.create(categoriesData);
  console.log(`Successfully seeded ${createdCats.length} categories.`);

  const targetCat = createdCats.find(c => c.name === "Organic Coconut Sugar");
  
  const productsWithCat = productsData.map(p => ({
    ...p,
    category: targetCat._id
  }));

  const createdProds = await Product.create(productsWithCat);
  console.log(`Successfully seeded ${createdProds.length} products.`);

  await mongoose.connection.close();
  console.log("Database connection closed. Seeding complete!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
