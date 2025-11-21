import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const c = localStorage.getItem("cart");
    if (c) setCart(JSON.parse(c));
  }, []);

  const updateQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) =>
        item._id === id
          ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) }
          : item
      )
      .filter((item) => item.qty > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 0),
    0
  );

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
          <h1 className="font-bold text-xl text-amber-900">Keranjang Belanja</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">Belum ada produk yang ditambahkan</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-semibold shadow-lg"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Produk Pesanan ({cart.length} item)
              </h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🥧
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-amber-600 font-bold text-lg mb-2">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white rounded-lg shadow-sm">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-amber-600 hover:bg-amber-50 rounded-l-lg transition-colors"
                            onClick={() => updateQty(item._id, -1)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-800">
                            {item.qty}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-amber-600 hover:bg-amber-50 rounded-r-lg transition-colors"
                            onClick={() => updateQty(item._id, +1)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                      <p className="font-bold text-xl text-gray-800">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Ringkasan Belanja
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total ({cart.length} item)</span>
                  <span className="font-semibold text-gray-800">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border-t-2 border-amber-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-amber-600">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/payment")}
                className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Lanjut ke Pembayaran
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Pengiriman dan metode pembayaran akan dipilih di halaman berikutnya
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}