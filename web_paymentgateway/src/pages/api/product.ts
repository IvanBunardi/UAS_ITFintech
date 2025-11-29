/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";
import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import type { RequestHandler } from "express";

// 🔧 Nonaktifkan bodyParser agar multer bisa jalan
export const config = { api: { bodyParser: false } };

// 🔧 Pastikan folder upload ada
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔧 Konfigurasi multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🔧 Tipe khusus untuk req dengan file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// 🔧 Helper untuk jalankan multer di Next.js
const runMulter = (req: NextApiRequest, res: NextApiResponse, fn: RequestHandler) =>
  new Promise<void>((resolve, reject) => {
    fn(req as any, res as any, (err?: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

// 🔧 Helper function untuk parse harga dengan aman - FIXED VERSION
const parsePrice = (priceInput: string | number | undefined): number => {
  if (priceInput === undefined || priceInput === null || priceInput === '') {
    console.warn('⚠️ Empty price input');
    return 0;
  }
  
  // Jika sudah number, pastikan tetap integer (NO ROUNDING!)
  if (typeof priceInput === 'number') {
    // Gunakan Math.floor untuk memastikan hasil integer tanpa pembulatan
    return Math.floor(priceInput);
  }
  
  // Convert ke string dulu untuk memastikan konsistensi
  let priceString = String(priceInput).trim();
  
  // Bersihkan string dari format rupiah, titik, koma, spasi
  priceString = priceString
    .replace(/Rp\.?\s*/gi, '')  // Hapus Rp (dengan/tanpa titik dan spasi)
    .replace(/\s+/g, '')         // Hapus semua spasi
    .replace(/\./g, '')          // Hapus titik (pemisah ribuan)
    .replace(/,\d+$/g, '');      // Hapus desimal jika ada (contoh: ,00 atau ,50)
  
  // Parsing dengan parseInt base 10 (PENTING: jangan pakai parseFloat!)
  const parsed = parseInt(priceString, 10);
  
  // Debug log
  console.log('🔍 Price parsing:', {
    originalInput: priceInput,
    inputType: typeof priceInput,
    cleaned: priceString,
    parsed: parsed,
    parsedType: typeof parsed
  });
  
  // Validasi hasil parsing
  if (isNaN(parsed) || parsed < 0) {
    console.error('❌ Invalid price detected:', {
      input: priceInput,
      cleaned: priceString,
      result: parsed
    });
    return 0;
  }
  
  return parsed;
};

// 🔧 Buat router next-connect
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// ======================================================================
// 🟢 POST → Tambah Produk
// ======================================================================
router.post(async (req, res) => {
  await runMulter(req, res, upload.single("image"));

  try {
    await dbConnect();

    const { name, category, price, description } = req.body as {
      name?: string;
      category?: string;
      price?: string;
      description?: string;
    };

    console.log('📥 POST Request body:', { name, category, price, description });

    if (!name || !category || !price || !description) {
      return res.status(400).json({ error: "name, category, price, description wajib diisi" });
    }

    // 🔥 Parse harga dengan benar
    const parsedPrice = parsePrice(price);
    
    if (parsedPrice === 0) {
      return res.status(400).json({ error: "Harga tidak valid atau kosong" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    // PENTING: Pastikan price disimpan sebagai integer
    const productData = {
      name,
      category,
      price: parsedPrice,
      description,
      imageUrl,
    };

    console.log('💾 Data yang akan disimpan:', productData);

    const product = await Product.create(productData);

    console.log('✅ Produk tersimpan di DB:', {
      id: product._id,
      name: product.name,
      price: product.price,
      priceType: typeof product.price
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("❌ POST /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🟡 GET → Ambil Semua Produk
// ======================================================================
router.get(async (_req, res) => {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    // Debug: Check price types
    if (products.length > 0) {
      console.log('📊 Sample product price:', {
        price: products[0].price,
        type: typeof products[0].price
      });
    }
    
    return res.status(200).json(products);
  } catch (err) {
    console.error("❌ GET /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🔵 PUT → Update Produk (gunakan query id)
// ======================================================================
router.put(async (req, res) => {
  await runMulter(req, res, upload.single("image"));

  try {
    await dbConnect();

    const { id } = req.query;
    const { name, category, price, description } = req.body;

    console.log('📥 PUT Request:', { id, name, category, price, description });

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Jika ada file baru → hapus file lama
    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), "public", existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    existing.name = name ?? existing.name;
    existing.category = category ?? existing.category;
    
    // 🔥 Parse harga dengan benar saat update
    if (price !== undefined && price !== null && price !== '') {
      const parsedPrice = parsePrice(price);
      console.log('💰 Update price:', { 
        oldPrice: existing.price, 
        newInput: price,
        newParsed: parsedPrice 
      });
      existing.price = parsedPrice;
    }
    
    existing.description = description ?? existing.description;
    existing.imageUrl = imageUrl;

    await existing.save();

    console.log('✅ Produk updated:', {
      id: existing._id,
      price: existing.price,
      priceType: typeof existing.price
    });

    return res.status(200).json(existing);
  } catch (err) {
    console.error("❌ PUT /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🔴 DELETE → Hapus Produk (gunakan query id)
// ======================================================================
router.delete(async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.query;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Hapus file gambar dari /public/uploads
    if (product.imageUrl) {
      const filePath = path.join(process.cwd(), "public", product.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🧩 Default export handler
// ======================================================================
export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  await router.run(req, res);
}