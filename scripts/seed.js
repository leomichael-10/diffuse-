import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Diffuse Egypt database...')

  // ── Admin ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash('diffuse2024', 10)
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@diffuse.eg' },
    update: {},
    create: { email: 'admin@diffuse.eg', password: adminHash, name: 'Diffuse Admin', role: 'admin', city: 'Cairo' },
  })
  // keep old email working for backwards compat
  await prisma.user.upsert({
    where:  { email: 'admin@diffuse.com' },
    update: {},
    create: { email: 'admin@diffuse.com', password: adminHash, name: 'Diffuse Admin', role: 'admin', city: 'Cairo' },
  })
  console.log('Admin:', admin.email)

  // ── Categories ─────────────────────────────────────────
  const catTops = await prisma.category.upsert({
    where:  { slug: 'tops' },
    update: {},
    create: { name: 'Tops', slug: 'tops', sortOrder: 1 },
  })
  const catBottoms = await prisma.category.upsert({
    where:  { slug: 'bottoms' },
    update: {},
    create: { name: 'Bottoms', slug: 'bottoms', sortOrder: 2 },
  })
  const catDresses = await prisma.category.upsert({
    where:  { slug: 'dresses' },
    update: {},
    create: { name: 'Dresses', slug: 'dresses', sortOrder: 3 },
  })
  const catOuterwear = await prisma.category.upsert({
    where:  { slug: 'outerwear' },
    update: {},
    create: { name: 'Outerwear', slug: 'outerwear', sortOrder: 4 },
  })
  const catKnitwear = await prisma.category.upsert({
    where:  { slug: 'knitwear' },
    update: {},
    create: { name: 'Knitwear', slug: 'knitwear', sortOrder: 5 },
  })
  const catAccessories = await prisma.category.upsert({
    where:  { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', sortOrder: 6 },
  })
  console.log('Categories created')

  // ── Products (EGP prices) ──────────────────────────────
  const products = [
    {
      name:        'Essential White Tee',
      brand:       'Diffuse',
      gender:      'Unisex',
      season:      'SS25',
      categoryId:  catTops.id,
      isActive:    true,
      isFeatured:  true,
      description: 'Our signature tee. Cut from 180gsm Pima cotton in a relaxed, slightly boxy silhouette. A wardrobe constant.',
      care:        'Machine wash 30°C. Tumble dry low.',
      variants: [
        { size: 'XS', color: 'White', colorHex: '#FFFFFF', material: '100% Pima Cotton', priceAed: 650,  stockQty: 40, skuCode: 'DIF-TEE-XS-WHT', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { size: 'S',  color: 'White', colorHex: '#FFFFFF', material: '100% Pima Cotton', priceAed: 650,  stockQty: 60, skuCode: 'DIF-TEE-S-WHT',  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { size: 'M',  color: 'White', colorHex: '#FFFFFF', material: '100% Pima Cotton', priceAed: 650,  stockQty: 60, skuCode: 'DIF-TEE-M-WHT',  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { size: 'L',  color: 'White', colorHex: '#FFFFFF', material: '100% Pima Cotton', priceAed: 650,  stockQty: 50, skuCode: 'DIF-TEE-L-WHT',  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { size: 'XL', color: 'White', colorHex: '#FFFFFF', material: '100% Pima Cotton', priceAed: 650,  stockQty: 30, skuCode: 'DIF-TEE-XL-WHT', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { size: 'S',  color: 'Black', colorHex: '#111111', material: '100% Pima Cotton', priceAed: 650,  stockQty: 55, skuCode: 'DIF-TEE-S-BLK',  image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80' },
        { size: 'M',  color: 'Black', colorHex: '#111111', material: '100% Pima Cotton', priceAed: 650,  stockQty: 55, skuCode: 'DIF-TEE-M-BLK',  image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80' },
        { size: 'L',  color: 'Black', colorHex: '#111111', material: '100% Pima Cotton', priceAed: 650,  stockQty: 45, skuCode: 'DIF-TEE-L-BLK',  image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80' },
      ],
    },
    {
      name:        'Relaxed Linen Shirt',
      brand:       'Diffuse',
      gender:      'Men',
      season:      'SS25',
      categoryId:  catTops.id,
      isActive:    true,
      isFeatured:  true,
      description: 'Woven from stonewashed European linen. Dropped shoulders, chest pocket, mother-of-pearl buttons. Designed to be worn open or buttoned.',
      care:        'Machine wash 40°C. Iron while damp.',
      variants: [
        { size: 'S',  color: 'Sand',  colorHex: '#C9A96E', material: '100% European Linen', priceAed: 1450, stockQty: 25, skuCode: 'DIF-LIN-S-SND',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
        { size: 'M',  color: 'Sand',  colorHex: '#C9A96E', material: '100% European Linen', priceAed: 1450, stockQty: 30, skuCode: 'DIF-LIN-M-SND',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
        { size: 'L',  color: 'Sand',  colorHex: '#C9A96E', material: '100% European Linen', priceAed: 1450, stockQty: 25, skuCode: 'DIF-LIN-L-SND',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
        { size: 'XL', color: 'Sand',  colorHex: '#C9A96E', material: '100% European Linen', priceAed: 1450, stockQty: 20, skuCode: 'DIF-LIN-XL-SND', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
        { size: 'S',  color: 'White', colorHex: '#FFFFFF', material: '100% European Linen', priceAed: 1450, stockQty: 20, skuCode: 'DIF-LIN-S-WHT',  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80' },
        { size: 'M',  color: 'White', colorHex: '#FFFFFF', material: '100% European Linen', priceAed: 1450, stockQty: 25, skuCode: 'DIF-LIN-M-WHT',  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80' },
        { size: 'L',  color: 'White', colorHex: '#FFFFFF', material: '100% European Linen', priceAed: 1450, stockQty: 20, skuCode: 'DIF-LIN-L-WHT',  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
      ],
    },
    {
      name:        'Classic Slim Trousers',
      brand:       'Diffuse',
      gender:      'Men',
      season:      'AW25',
      categoryId:  catBottoms.id,
      isActive:    true,
      isFeatured:  false,
      description: 'Tailored in a slim, tapered cut from a wool-blend twill. Mid-rise with a clean front and subtle side pockets.',
      care:        'Dry clean recommended. Steam to refresh.',
      variants: [
        { size: '28', color: 'Charcoal', colorHex: '#4A4A4A', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 15, skuCode: 'DIF-TRS-28-CHA', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80' },
        { size: '30', color: 'Charcoal', colorHex: '#4A4A4A', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 20, skuCode: 'DIF-TRS-30-CHA', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80' },
        { size: '32', color: 'Charcoal', colorHex: '#4A4A4A', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 20, skuCode: 'DIF-TRS-32-CHA', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80' },
        { size: '34', color: 'Charcoal', colorHex: '#4A4A4A', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 15, skuCode: 'DIF-TRS-34-CHA', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80' },
        { size: '30', color: 'Navy',     colorHex: '#1E3A5F', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 18, skuCode: 'DIF-TRS-30-NVY', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80' },
        { size: '32', color: 'Navy',     colorHex: '#1E3A5F', material: '60% Wool, 40% Polyester', priceAed: 2200, stockQty: 18, skuCode: 'DIF-TRS-32-NVY', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80' },
      ],
    },
    {
      name:        'Minimal Blazer',
      brand:       'Diffuse',
      gender:      'Unisex',
      season:      'AW25',
      categoryId:  catOuterwear.id,
      isActive:    true,
      isFeatured:  true,
      description: 'An unstructured single-breasted blazer with clean lapels and welt pockets. Cut from a medium-weight virgin wool blend.',
      care:        'Dry clean only.',
      variants: [
        { size: 'XS', color: 'Black', colorHex: '#111111', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 10, skuCode: 'DIF-BLZ-XS-BLK', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
        { size: 'S',  color: 'Black', colorHex: '#111111', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 15, skuCode: 'DIF-BLZ-S-BLK',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
        { size: 'M',  color: 'Black', colorHex: '#111111', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 15, skuCode: 'DIF-BLZ-M-BLK',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
        { size: 'L',  color: 'Black', colorHex: '#111111', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 12, skuCode: 'DIF-BLZ-L-BLK',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
        { size: 'S',  color: 'Ecru',  colorHex: '#F0EBE1', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 8,  skuCode: 'DIF-BLZ-S-ECR',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
        { size: 'M',  color: 'Ecru',  colorHex: '#F0EBE1', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 10, skuCode: 'DIF-BLZ-M-ECR',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
        { size: 'L',  color: 'Ecru',  colorHex: '#F0EBE1', material: '70% Virgin Wool, 30% Polyester', priceAed: 4800, stockQty: 8,  skuCode: 'DIF-BLZ-L-ECR',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
      ],
    },
    {
      name:        'Slip Dress',
      brand:       'Diffuse',
      gender:      'Women',
      season:      'SS25',
      categoryId:  catDresses.id,
      isActive:    true,
      isFeatured:  true,
      description: 'A fluid bias-cut slip dress in sand-washed silk charmeuse. Adjustable spaghetti straps, deep V-neckline, midi length.',
      care:        'Hand wash cold. Do not tumble dry.',
      variants: [
        { size: 'XS', color: 'Champagne', colorHex: '#D4B896', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 8,  skuCode: 'DIF-SLP-XS-CHP', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
        { size: 'S',  color: 'Champagne', colorHex: '#D4B896', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 12, skuCode: 'DIF-SLP-S-CHP',  image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
        { size: 'M',  color: 'Champagne', colorHex: '#D4B896', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 12, skuCode: 'DIF-SLP-M-CHP',  image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
        { size: 'L',  color: 'Champagne', colorHex: '#D4B896', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 8,  skuCode: 'DIF-SLP-L-CHP',  image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
        { size: 'XS', color: 'Black',     colorHex: '#111111', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 8,  skuCode: 'DIF-SLP-XS-BLK', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80' },
        { size: 'S',  color: 'Black',     colorHex: '#111111', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 10, skuCode: 'DIF-SLP-S-BLK',  image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80' },
        { size: 'M',  color: 'Black',     colorHex: '#111111', material: '100% Silk Charmeuse', priceAed: 2400, stockQty: 10, skuCode: 'DIF-SLP-M-BLK',  image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
      ],
    },
    {
      name:        'Wide Leg Trousers',
      brand:       'Diffuse',
      gender:      'Women',
      season:      'SS25',
      categoryId:  catBottoms.id,
      isActive:    true,
      isFeatured:  false,
      description: 'High-rise wide-leg trousers with a fluid drape. Cut from a lightweight crepe blend. Press crease down the front.',
      care:        'Machine wash 30°C. Press with damp cloth.',
      variants: [
        { size: 'XS', color: 'Oat',   colorHex: '#E8DDD0', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 15, skuCode: 'DIF-WLT-XS-OAT', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
        { size: 'S',  color: 'Oat',   colorHex: '#E8DDD0', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 20, skuCode: 'DIF-WLT-S-OAT',  image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
        { size: 'M',  color: 'Oat',   colorHex: '#E8DDD0', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 18, skuCode: 'DIF-WLT-M-OAT',  image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
        { size: 'L',  color: 'Oat',   colorHex: '#E8DDD0', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 12, skuCode: 'DIF-WLT-L-OAT',  image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
        { size: 'S',  color: 'Black', colorHex: '#111111', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 18, skuCode: 'DIF-WLT-S-BLK',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
        { size: 'M',  color: 'Black', colorHex: '#111111', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 18, skuCode: 'DIF-WLT-M-BLK',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
        { size: 'L',  color: 'Black', colorHex: '#111111', material: '55% Viscose, 45% Linen', priceAed: 1850, stockQty: 14, skuCode: 'DIF-WLT-L-BLK',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b1e02?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80' },
      ],
    },
    {
      name:        'Oversized Knit Sweater',
      brand:       'Diffuse',
      gender:      'Unisex',
      season:      'AW25',
      categoryId:  catKnitwear.id,
      isActive:    true,
      isFeatured:  true,
      description: 'A generous, boxy knit in 100% merino wool. Ribbed collar, cuffs and hem. Wears well over shirting or alone.',
      care:        'Hand wash cold. Lay flat to dry.',
      variants: [
        { size: 'XS', color: 'Oatmeal',  colorHex: '#D9CFC5', material: '100% Merino Wool', priceAed: 2800, stockQty: 12, skuCode: 'DIF-KNT-XS-OAT', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80' },
        { size: 'S',  color: 'Oatmeal',  colorHex: '#D9CFC5', material: '100% Merino Wool', priceAed: 2800, stockQty: 18, skuCode: 'DIF-KNT-S-OAT',  image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80' },
        { size: 'M',  color: 'Oatmeal',  colorHex: '#D9CFC5', material: '100% Merino Wool', priceAed: 2800, stockQty: 18, skuCode: 'DIF-KNT-M-OAT',  image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80' },
        { size: 'L',  color: 'Oatmeal',  colorHex: '#D9CFC5', material: '100% Merino Wool', priceAed: 2800, stockQty: 12, skuCode: 'DIF-KNT-L-OAT',  image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80' },
        { size: 'S',  color: 'Charcoal', colorHex: '#4A4A4A', material: '100% Merino Wool', priceAed: 2800, stockQty: 15, skuCode: 'DIF-KNT-S-CHA',  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80' },
        { size: 'M',  color: 'Charcoal', colorHex: '#4A4A4A', material: '100% Merino Wool', priceAed: 2800, stockQty: 15, skuCode: 'DIF-KNT-M-CHA',  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80' },
        { size: 'L',  color: 'Charcoal', colorHex: '#4A4A4A', material: '100% Merino Wool', priceAed: 2800, stockQty: 10, skuCode: 'DIF-KNT-L-CHA',  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80' },
      ],
    },
    {
      name:        'Structured Tote Bag',
      brand:       'Diffuse',
      gender:      'Unisex',
      season:      'SS25',
      categoryId:  catAccessories.id,
      isActive:    true,
      isFeatured:  false,
      description: 'A minimal structured tote in full-grain vegetable-tanned leather. Wide open top, interior zip pocket, leather base studs.',
      care:        'Wipe clean with dry cloth. Condition leather twice yearly.',
      variants: [
        { size: 'One Size', color: 'Tan',   colorHex: '#C9A96E', material: 'Full-Grain Vegetable-Tanned Leather', priceAed: 3900, stockQty: 8, skuCode: 'DIF-TOT-OS-TAN', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80' },
        { size: 'One Size', color: 'Black', colorHex: '#111111', material: 'Full-Grain Vegetable-Tanned Leather', priceAed: 3900, stockQty: 8, skuCode: 'DIF-TOT-OS-BLK', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80' },
      ],
    },
  ]

  for (const pd of products) {
    const { variants, images, ...productData } = pd
    const existing = await prisma.product.findFirst({ where: { name: pd.name, brand: 'Diffuse' } })
    if (existing) {
      // Update variant images by skuCode for existing products
      for (const v of variants) {
        if (v.image && v.skuCode) {
          await prisma.productVariant.updateMany({
            where: { skuCode: v.skuCode, image: null },
            data:  { image: v.image },
          })
        }
      }
      console.log(`  Updated variant images: ${pd.name}`)
      continue
    }
    await prisma.product.create({
      data: {
        ...productData,
        variants: { create: variants },
        images:   { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
      },
    })
    console.log(`  Created: ${pd.name}`)
  }

  // Promo codes
  console.log('\nSeeding promo codes...')
  const promos = [
    { code: 'WELCOME10', discountType: 'percent',  discountValue: 10, minOrderAed: 200 },
    { code: 'CAIRO50',   discountType: 'fixed',    discountValue: 50, minOrderAed: 500 },
    { code: 'DIFFUSE20', discountType: 'percent',  discountValue: 20, minOrderAed: 800 },
  ]
  for (const promo of promos) {
    await prisma.promoCode.upsert({
      where:  { code: promo.code },
      update: {},
      create: promo,
    })
    console.log(`  Upserted: ${promo.code}`)
  }

  console.log('\nSeed complete.')
  console.log('Admin login: admin@diffuse.eg / diffuse2024')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
