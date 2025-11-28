import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  category?: string;
  description?: string;
}

interface PaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  invoiceUrl?: string;
  virtualAccount?: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  expiryTime?: string;
  dokuResponse?: any;
}

export default function PaymentPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '', // Field ini sekarang berfungsi ganda: Alamat & Catatan
  });

  const SHIPPING_COST = 0;

  useEffect(() => {
    const c = localStorage.getItem('cart');
    if (c) {
      try {
        setCart(JSON.parse(c));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- VALIDASI ---
    if (!formData.customerName.trim()) {
      setError('Nama harus diisi');
      setLoading(false);
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('Nomor telepon harus diisi');
      setLoading(false);
      return;
    }
    
    // Validasi Alamat/Catatan (Wajib diisi karena butuh alamat)
    if (!formData.notes.trim()) {
      setError('Mohon isi Alamat Pengiriman agar paket dapat dikirim');
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError('Keranjang kosong');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        items: cart,
        totalPrice: Math.round(total),
        email: formData.customerEmail || 'noemail@example.com',
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        notes: formData.notes.trim(), // Mengirim alamat/catatan ke backend
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: PaymentResponse = await res.json();

      if (!res.ok) {
        const msg = (data as any)?.error || (data as any)?.details || 'Gagal membuat pembayaran';
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      if (data.checkoutUrl) {
        localStorage.removeItem('cart');
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.invoiceUrl) {
        localStorage.removeItem('cart');
        window.location.href = data.invoiceUrl;
        return;
      }

      if (data.virtualAccount) {
        setPaymentInfo(data);
        localStorage.removeItem('cart');
        setLoading(false);
        return;
      }

      throw new Error('Tidak ada informasi pembayaran dari DOKU');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMsg);
      console.error('Error:', err);
      setLoading(false);
    }
  };

  // UI Halaman Sukses (Virtual Account)
  if (paymentInfo && paymentInfo.virtualAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 relative overflow-x-hidden flex items-center justify-center p-4">
        {/* Decorative circles */}
        <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="fixed top-40 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full border-2 border-pink-200 relative">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
              Pesanan Berhasil Dibuat! 🎉
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              Silakan transfer ke nomor Virtual Account di bawah ini
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 border-2 border-pink-300 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-sm text-gray-600 mb-3 font-bold uppercase tracking-wide">Nomor Virtual Account</p>
            <div className="flex items-center justify-between bg-white rounded-xl px-5 py-4 mb-5 shadow-md border-2 border-pink-200">
              <span className="text-2xl font-mono font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {paymentInfo.virtualAccount}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentInfo.virtualAccount!);
                  alert('Nomor VA berhasil disalin!');
                }}
                className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Salin
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-3 border-b-2 border-pink-200">
                <span className="text-gray-600 font-semibold">Total Pembayaran</span>
                <span className="font-black text-xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Rp {(paymentInfo.amount ?? total).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b-2 border-pink-200">
                <span className="text-gray-600 font-semibold">Nomor Pesanan</span>
                <span className="font-bold text-gray-800">{paymentInfo.orderNumber}</span>
              </div>
              {paymentInfo.expiryTime && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-semibold">Berlaku Hingga</span>
                  <span className="font-bold text-gray-800">
                    {new Date(paymentInfo.expiryTime).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push(`/orders/${paymentInfo!.orderId}`)}
              className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white py-5 rounded-2xl font-black text-lg hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            >
              Lihat Detail Pesanan
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white border-2 border-pink-300 text-gray-700 py-4 rounded-2xl font-bold hover:bg-pink-50 hover:border-pink-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // UI Halaman Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 relative overflow-x-hidden">
      {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-40 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <header className="bg-white/90 backdrop-blur-lg shadow-xl sticky top-0 z-10 border-b-4 border-pink-400">
        <div className="px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-pink-50 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="font-black text-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Pembayaran
            </h1>
          </div>
          <div className="w-32" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-black text-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                Informasi Pembeli
              </h2>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-md">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full border-2 border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:border-pink-500 transition-all duration-300 font-medium shadow-sm focus:shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nomor Telepon/WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full border-2 border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:border-pink-500 transition-all duration-300 font-medium shadow-sm focus:shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full border-2 border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:border-pink-500 transition-all duration-300 font-medium shadow-sm focus:shadow-md"
                />
              </div>

              {/* === PERUBAHAN DI SINI === */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Alamat Pengiriman & Pesan Tambahan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Mohon tuliskan alamat lengkap untuk pengiriman paket (Jalan, No, Kel/Kec, Kota, Kode Pos). Anda juga bisa menambahkan catatan khusus lainnya."
                  rows={4}
                  className="w-full border-2 border-pink-200 rounded-xl px-5 py-4 focus:outline-none focus:border-pink-500 transition-all duration-300 resize-none font-medium shadow-sm focus:shadow-md"
                />
              </div>
              {/* ========================= */}

              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white py-5 rounded-2xl font-black text-xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut ke Pembayaran
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-24 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="font-black text-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                Ringkasan Pesanan
              </h2>
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl border-2 border-pink-200">
                  <div className="text-6xl mb-3 animate-bounce">🛒</div>
                  <p className="text-gray-600 font-semibold">Keranjang kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 rounded-xl overflow-hidden relative flex-shrink-0 shadow-lg">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🥧
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate mb-1">{item.name}</p>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {item.qty}x @ Rp {item.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-4 border-pink-300 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-black text-gray-800">Total Pembayaran</span>
                <span className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-5 border-2 border-pink-200 shadow-md">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-semibold">
                    Pembayaran aman dengan sistem DOKU
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}