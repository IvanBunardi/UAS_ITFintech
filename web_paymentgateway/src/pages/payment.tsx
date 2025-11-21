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
    notes: '',
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
        notes: formData.notes.trim(),
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

  // UI untuk Virtual Account
  if (paymentInfo && paymentInfo.virtualAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Pesanan Berhasil Dibuat! 🎉
            </h2>
            <p className="text-gray-600">
              Silakan transfer ke nomor Virtual Account di bawah ini
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-3 font-medium">Nomor Virtual Account</p>
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-4 mb-4 shadow-sm">
              <span className="text-2xl font-mono font-bold text-blue-600">
                {paymentInfo.virtualAccount}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentInfo.virtualAccount!);
                  alert('Nomor VA berhasil disalin!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Salin
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-gray-600">Total Pembayaran</span>
                <span className="font-bold text-lg text-gray-800">
                  Rp {(paymentInfo.amount ?? total).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Nomor Pesanan</span>
                <span className="font-semibold text-gray-800">{paymentInfo.orderNumber}</span>
              </div>
              {paymentInfo.expiryTime && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Berlaku Hingga</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(paymentInfo.expiryTime).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/orders/${paymentInfo!.orderId}`)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              Lihat Detail Pesanan
            </button>
            <button
              onClick={() => router.push('/user')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-900 font-medium hover:text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="font-bold text-xl text-amber-900">Pembayaran</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Informasi Pembeli</h2>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Telepon/WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan Pesanan (Opsional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Contoh: Tolong kirim pagi hari, dll."
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut ke Pembayaran
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Ringkasan Pesanan</h2>
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="text-gray-500 text-sm">Keranjang kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                      🥧
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.qty}x @ Rp {item.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm font-bold text-amber-600 mt-1">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-2 border-amber-100 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-800">Total Pembayaran</span>
                <span className="text-2xl font-bold text-amber-600">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs text-gray-600">
                    Pembayaran aman dengan sistem DOKU
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}