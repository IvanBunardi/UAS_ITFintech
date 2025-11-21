// /pages/api/auth/register.js
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
  }

  await dbConnect();

  const { name, email, password, whatsapp, role } = req.body;

  if (!name || !email || !password || !whatsapp) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }

  try {
    // Cek user sudah ada atau belum
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email sudah digunakan.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user tanpa OTP
    const user = new User({
      name,
      email,
      password: hashedPassword,
      whatsapp,
      role: role === 'admin' ? 'admin' : 'user',
    });

    await user.save();

    return res.status(200).json({
      message: 'Akun berhasil dibuat! Silakan login.',
    });

  } catch (error) {
    console.error('❌ Error register:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}
