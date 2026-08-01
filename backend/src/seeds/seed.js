require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');

const categories = [
  { name: 'Mobile Phones', slug: 'mobile-phones', description: 'Latest smartphones from top brands', icon: 'Smartphone', order: 1 },
  { name: 'Chargers', slug: 'chargers', description: 'Fast chargers and wireless charging solutions', icon: 'Zap', order: 2 },
  { name: 'Earbuds', slug: 'earbuds', description: 'Wireless and wired earbuds', icon: 'Headphones', order: 3 },
  { name: 'Headphones', slug: 'headphones', description: 'Over-ear and on-ear headphones', icon: 'Headphones', order: 4 },
  { name: 'Smart Watches', slug: 'smart-watches', description: 'Smart wearables and fitness trackers', icon: 'Watch', order: 5 },
  { name: 'Covers', slug: 'covers', description: 'Phone cases and protective covers', icon: 'Shield', order: 6 },
  { name: 'Tempered Glass', slug: 'tempered-glass', description: 'Screen protectors and tempered glass', icon: 'Monitor', order: 7 },
  { name: 'Cables', slug: 'cables', description: 'USB-C, Lightning, and Micro-USB cables', icon: 'Cable', order: 8 },
  { name: 'Power Banks', slug: 'power-banks', description: 'Portable power banks and battery packs', icon: 'Battery', order: 9 },
  { name: 'Accessories', slug: 'accessories', description: 'Stands, mounts, and other accessories', icon: 'Package', order: 10 },
];

const brands = [
  { name: 'Apple', slug: 'apple', description: 'Premium technology products' },
  { name: 'Samsung', slug: 'samsung', description: 'Innovation for everyone' },
  { name: 'OnePlus', slug: 'oneplus', description: 'Never settle' },
  { name: 'Xiaomi', slug: 'xiaomi', description: 'Innovation for everyone' },
  { name: 'Sony', slug: 'sony', description: 'Make.Believe' },
  { name: 'JBL', slug: 'jbl', description: 'Sound that moves you' },
  { name: 'Anker', slug: 'anker', description: 'Charging made easy' },
  { name: 'Spigen', slug: 'spigen', description: 'Essential protection' },
  { name: 'Baseus', slug: 'baseus', description: 'Tech accessories' },
  { name: 'Realme', slug: 'realme', description: 'Dare to leap' },
];

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most powerful iPhone ever. A17 Pro chip, titanium design, and advanced camera system.',
    shortDescription: 'Apple flagship with A17 Pro chip and titanium design',
    price: 289999,
    discount: 5,
    stock: 25,
    sku: 'APL-IP15PM-256',
    tags: ['featured', 'best-seller'],
    isFeatured: true,
    isBestSeller: true,
    color: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
    storage: ['256GB', '512GB', '1TB'],
    ram: ['8GB'],
    processor: 'A17 Pro',
    display: '6.7" Super Retina XDR OLED',
    camera: '48MP + 12MP + 12MP',
    battery: '4441 mAh',
    connectivity: ['5G', 'Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'],
    warranty: '1 Year Apple Warranty',
    features: ['Dynamic Island', 'Action Button', 'ProMotion', 'Always-On Display'],
    specifications: [
      { key: 'Chip', value: 'A17 Pro' },
      { key: 'Display', value: '6.7-inch Super Retina XDR' },
      { key: 'Camera', value: '48MP Main' },
      { key: 'Material', value: 'Titanium' },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Galaxy AI is here. Search like never before, Circle to Search, and AI-powered camera.',
    shortDescription: 'Samsung flagship with Galaxy AI',
    price: 259999,
    discount: 8,
    stock: 30,
    sku: 'SAM-S24U-256',
    tags: ['featured', 'trending'],
    isFeatured: true,
    isTrending: true,
    color: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
    storage: ['256GB', '512GB', '1TB'],
    ram: ['12GB'],
    processor: 'Snapdragon 8 Gen 3',
    display: '6.8" Dynamic AMOLED 2X',
    camera: '200MP + 12MP + 50MP + 10MP',
    battery: '5000 mAh',
    connectivity: ['5G', 'Wi-Fi 7', 'Bluetooth 5.3', 'S Pen'],
    warranty: '1 Year Samsung Warranty',
    features: ['Galaxy AI', 'S Pen', '120Hz', 'Titanium Frame'],
    specifications: [
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Display', value: '6.8-inch QHD+' },
      { key: 'Camera', value: '200MP' },
      { key: 'S Pen', value: 'Built-in' },
    ],
  },
  {
    name: 'OnePlus 12',
    description: 'The new standard of flagship. Snapdragon 8 Gen 3 with 100W SUPERVOOC charging.',
    shortDescription: 'Flagship killer with 100W fast charging',
    price: 89999,
    discount: 10,
    stock: 40,
    sku: 'OP-12-256',
    tags: ['trending', 'best-seller'],
    isTrending: true,
    isBestSeller: true,
    color: ['Silky Black', 'Flowy Emerald'],
    storage: ['256GB', '512GB'],
    ram: ['12GB', '16GB'],
    processor: 'Snapdragon 8 Gen 3',
    display: '6.82" LTPO AMOLED',
    camera: '50MP + 48MP + 64MP',
    battery: '5400 mAh',
    connectivity: ['5G', 'Wi-Fi 7', 'Bluetooth 5.4'],
    warranty: '1 Year OnePlus Warranty',
    features: ['100W SUPERVOOC', 'Hasselblad Camera', '120Hz', 'IP65'],
    specifications: [
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Display', value: '6.82-inch 2K LTPO' },
      { key: 'Charging', value: '100W Wired, 50W Wireless' },
    ],
  },
  {
    name: 'AirPods Pro 2nd Gen',
    description: 'Adaptive Audio. Personalized Spatial Audio. USB-C charging.',
    shortDescription: 'Active noise cancellation with Adaptive Audio',
    price: 44999,
    discount: 5,
    stock: 50,
    sku: 'APL-APP2-USBC',
    tags: ['featured', 'best-seller'],
    isFeatured: true,
    isBestSeller: true,
    color: ['White'],
    warranty: '1 Year Apple Warranty',
    features: ['Active Noise Cancellation', 'Adaptive Audio', 'Personalized Spatial Audio', 'USB-C'],
    specifications: [
      { key: 'Chip', value: 'H2' },
      { key: 'ANC', value: 'Active' },
      { key: 'Battery', value: '6h (30h with case)' },
      { key: 'Charging', value: 'USB-C, MagSafe' },
    ],
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    description: 'Intelligent ANC. Hi-Fi 24bit audio. Seamless device connectivity.',
    shortDescription: 'Premium ANC earbuds with Hi-Fi sound',
    price: 27999,
    discount: 15,
    stock: 35,
    sku: 'SAM-GB2P',
    tags: ['trending'],
    isTrending: true,
    color: ['Graphite', 'White', 'Bora Purple'],
    warranty: '1 Year Samsung Warranty',
    features: ['Intelligent ANC', '24bit Hi-Fi', '360 Audio', 'IPX7'],
    specifications: [
      { key: 'Driver', value: '10mm' },
      { key: 'ANC', value: 'Intelligent' },
      { key: 'Battery', value: '5h (18h with case)' },
    ],
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation. Exceptional sound quality. 30-hour battery.',
    shortDescription: 'Industry-leading noise cancelling headphones',
    price: 64999,
    discount: 10,
    stock: 20,
    sku: 'SNY-WH1000XM5',
    tags: ['featured'],
    isFeatured: true,
    color: ['Black', 'Silver', 'Midnight Blue'],
    warranty: '1 Year Sony Warranty',
    features: ['Industry-leading ANC', '30h Battery', 'Multipoint', 'Speak-to-Chat'],
    specifications: [
      { key: 'Driver', value: '30mm' },
      { key: 'ANC', value: 'Auto NC Optimizer' },
      { key: 'Battery', value: '30 hours' },
      { key: 'Weight', value: '250g' },
    ],
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Smarter. Brighter. Mightier. S9 chip with Double Tap gesture.',
    shortDescription: 'Most advanced Apple Watch with S9 chip',
    price: 69999,
    discount: 5,
    stock: 15,
    sku: 'APL-AWS9-45',
    tags: ['new-arrival'],
    isNewArrival: true,
    color: ['Midnight', 'Starlight', 'Silver', 'PRODUCT(RED)'],
    storage: ['32GB'],
    warranty: '1 Year Apple Warranty',
    features: ['Double Tap', 'Always-On Display', 'Blood Oxygen', 'ECG'],
    specifications: [
      { key: 'Chip', value: 'S9 SiP' },
      { key: 'Display', value: '45mm Always-On Retina' },
      { key: 'Battery', value: '18 hours' },
      { key: 'Water Resistance', value: 'WR50' },
    ],
  },
  {
    name: 'Anker Nano Power Bank 10K',
    description: 'Compact 10,000mAh power bank with 20W fast charging and built-in cables.',
    shortDescription: 'Compact 10K power bank with fast charging',
    price: 5999,
    discount: 0,
    stock: 100,
    sku: 'ANK-NP10K',
    tags: ['best-seller'],
    isBestSeller: true,
    color: ['Black', 'White', 'Blue'],
    warranty: '18 Months Anker Warranty',
    features: ['20W Fast Charging', 'Built-in Cables', 'LED Indicator', 'Compact Design'],
    specifications: [
      { key: 'Capacity', value: '10,000mAh' },
      { key: 'Output', value: '20W USB-C' },
      { key: 'Weight', value: '210g' },
    ],
  },
  {
    name: 'Baseus 65W GaN Charger',
    description: 'Ultra-compact 65W GaN charger with 3 ports. Charge laptop, phone, and tablet simultaneously.',
    shortDescription: 'Compact 65W 3-port GaN charger',
    price: 4999,
    discount: 20,
    stock: 80,
    sku: 'BSU-GAN65',
    tags: ['trending'],
    isTrending: true,
    color: ['Black', 'White'],
    warranty: '1 Year Baseus Warranty',
    features: ['65W Output', '3 Ports', 'GaN Technology', 'Foldable Plug'],
    specifications: [
      { key: 'Ports', value: '2x USB-C, 1x USB-A' },
      { key: 'Technology', value: 'GaN III' },
      { key: 'Weight', value: '120g' },
    ],
  },
  {
    name: 'Spigen Tough Armor Case',
    description: 'Extreme protection with kickstand. Military-grade drop tested.',
    shortDescription: 'Military-grade protective case',
    price: 3999,
    discount: 0,
    stock: 200,
    sku: 'SPG-TA-IP15',
    tags: ['best-seller'],
    isBestSeller: true,
    color: ['Black', 'Gunmetal', 'Champagne Gold'],
    warranty: 'Lifetime Spigen Warranty',
    features: ['Military-Grade', 'Kickstand', 'Air Cushion Technology', 'Wireless Charging Compatible'],
    specifications: [
      { key: 'Material', value: 'TPU + Polycarbonate' },
      { key: 'Drop Rating', value: 'MIL-STD-810G' },
    ],
  },
  {
    name: 'Realme GT 5 Pro',
    description: 'Snapdragon 8 Gen 3 with 5400mAh battery and 100W SUPERVOOC charging.',
    shortDescription: 'Performance flagship with Snapdragon 8 Gen 3',
    price: 69999,
    discount: 12,
    stock: 25,
    sku: 'RLM-GT5P',
    tags: ['new-arrival'],
    isNewArrival: true,
    color: ['Liquid Orange', 'Avalanche White'],
    storage: ['256GB', '512GB'],
    ram: ['12GB', '16GB'],
    processor: 'Snapdragon 8 Gen 3',
    display: '6.78" LTPO AMOLED',
    camera: '50MP + 8MP + 50MP',
    battery: '5400 mAh',
    connectivity: ['5G', 'Wi-Fi 7', 'Bluetooth 5.3'],
    warranty: '1 Year Realme Warranty',
    features: ['100W SUPERVOOC', 'Sony IMX890', 'VC Cooling', '120Hz'],
    specifications: [
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Display', value: '6.78-inch 1.5K' },
      { key: 'Charging', value: '100W' },
    ],
  },
  {
    name: 'Xiaomi 14',
    description: 'Leica optics. Snapdragon 8 Gen 3. Premium compact flagship.',
    shortDescription: 'Compact flagship with Leica cameras',
    price: 79999,
    discount: 5,
    stock: 20,
    sku: 'XMI-14',
    tags: ['new-arrival', 'featured'],
    isNewArrival: true,
    isFeatured: true,
    color: ['Black', 'White', 'Green'],
    storage: ['256GB', '512GB'],
    ram: ['12GB', '16GB'],
    processor: 'Snapdragon 8 Gen 3',
    display: '6.36" LTPO AMOLED',
    camera: '50MP + 50MP + 50MP',
    battery: '4610 mAh',
    connectivity: ['5G', 'Wi-Fi 7', 'Bluetooth 5.3'],
    warranty: '1 Year Xiaomi Warranty',
    features: ['Leica Optics', '90W HyperCharge', 'IP68', 'Slim Bezel'],
    specifications: [
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Display', value: '6.36-inch 1.5K' },
      { key: 'Camera', value: 'Leica Summilux' },
    ],
  },
];

const banners = [
  { title: 'New Season, New Tech', subtitle: 'Up to 30% off on latest gadgets', position: 'hero', order: 1, isActive: true },
  { title: 'iPhone 15 Pro Max', subtitle: 'Titanium. So strong. So light. So Pro.', position: 'hero', order: 2, isActive: true },
  { title: 'Power Up Your Life', subtitle: 'Chargers, cables, and power banks on sale', position: 'promo', order: 1, isActive: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/velora');
    console.log('Connected to MongoDB');

    await Promise.all([
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
    ]);

    const createdCategories = await Category.insertMany(categories);
    const createdBrands = await Brand.insertMany(brands);

    const categoryMap = {};
    createdCategories.forEach(c => { categoryMap[c.name] = c._id; });
    const brandMap = {};
    createdBrands.forEach(b => { brandMap[b.name] = b._id; });

    const categoryAssign = {
      'iPhone 15 Pro Max': 'Mobile Phones',
      'Samsung Galaxy S24 Ultra': 'Mobile Phones',
      'OnePlus 12': 'Mobile Phones',
      'AirPods Pro 2nd Gen': 'Earbuds',
      'Samsung Galaxy Buds2 Pro': 'Earbuds',
      'Sony WH-1000XM5': 'Headphones',
      'Apple Watch Series 9': 'Smart Watches',
      'Anker Nano Power Bank 10K': 'Power Banks',
      'Baseus 65W GaN Charger': 'Chargers',
      'Spigen Tough Armor Case': 'Covers',
      'Realme GT 5 Pro': 'Mobile Phones',
      'Xiaomi 14': 'Mobile Phones',
    };

    const productDocs = products.map(p => ({
      ...p,
      category: categoryMap[categoryAssign[p.name]],
      brand: brandMap[Object.keys(brandMap).find(b => p.name.toLowerCase().includes(b.toLowerCase())) || 'Apple'],
      images: [{ url: `https://placehold.co/800x800/1a1a2e/ffffff?text=${encodeURIComponent(p.name.split(' ')[0])}`, alt: p.name }],
    }));

    await Product.insertMany(productDocs);
    await Banner.insertMany(banners);

    console.log('Seed completed successfully!');
    console.log(`Created: ${createdCategories.length} categories, ${createdBrands.length} brands, ${productDocs.length} products, ${banners.length} banners`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
