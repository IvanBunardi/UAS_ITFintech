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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="font-black text-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Keranjang Belanja
            </h1>
          </div>
          <div className="w-32" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 relative">
        {cart.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border-2 border-pink-200 mt-10">
            <div className="text-8xl mb-6 animate-bounce">🛒</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
              Keranjang Kosong
            </h2>
            <p className="text-gray-600 text-lg mb-8 font-medium">Belum ada produk yang ditambahkan</p>
            <button
              onClick={() => router.back()}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                    Produk Pesanan
                  </span>
                  <span className="text-gray-600 text-lg ml-2">({cart.length} item)</span>
                </div>
              </h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center gap-5 p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl hover:from-pink-100 hover:via-rose-100 hover:to-pink-100 transition-all duration-300 border-2 border-pink-200 hover:border-pink-400 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <div className="w-28 h-28 bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-lg">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          🥧
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white rounded-xl shadow-md border-2 border-pink-200">
                          <button
                            className="w-10 h-10 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-l-xl transition-colors font-bold text-xl"
                            onClick={() => updateQty(item._id, -1)}
                          >
                            −
                          </button>
                          <span className="w-14 text-center font-black text-lg text-gray-800">
                            {item.qty}
                          </span>
                          <button
                            className="w-10 h-10 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-r-xl transition-colors font-bold text-xl"
                            onClick={() => updateQty(item._id, +1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-red-300 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                          title="Hapus item"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Subtotal</p>
                      <p className="font-black text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                  Ringkasan Belanja
                </span>
              </h2>

              <div className="space-y-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-pink-200">
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700 font-semibold text-lg">Total ({cart.length} item)</span>
                  <span className="font-bold text-xl text-gray-800">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border-t-4 border-pink-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-gray-800">Total Pembayaran</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/payment")}
                className="w-full mt-8 py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl font-black text-xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
              >
                <span>Lanjut ke Pembayaran</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <p className="text-center text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pengiriman dan metode pembayaran akan dipilih di halaman berikutnya
                </p>
              </div>
            </div>
          </div>
        )}
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