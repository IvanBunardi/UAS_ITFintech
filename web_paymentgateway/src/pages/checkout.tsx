// @ts-nocheck
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  category?: string;
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 relative overflow-x-hidden font-sans">
      {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-40 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <header className="bg-white/90 backdrop-blur-lg shadow-xl sticky top-0 z-50 border-b-4 border-pink-400">
        <div className="px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-pink-50 transform hover:scale-105 active:scale-95"
          >
            <span className="text-xl">←</span>
            Kembali
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <h1 className="font-black text-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Keranjang Belanja
            </h1>
          </div>
          
          {/* Spacer for alignment */}
          <div className="w-24 hidden md:block" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 relative z-10">
        {cart.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border-2 border-pink-200 mt-10 animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce">🛍️</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
              Keranjang Kosong
            </h2>
            <p className="text-gray-600 text-lg mb-8 font-medium">Belum ada pia lezat yang ditambahkan</p>
            <button
              onClick={() => router.push('/')}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 inline-flex items-center gap-3"
            >
              <span>🥧</span>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg text-white text-xl">
                  📝
                </div>
                <div>
                  <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                    Produk Pesanan
                  </span>
                  <span className="text-gray-500 text-lg ml-2 font-bold bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                    {cart.length} item
                  </span>
                </div>
              </h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="group flex flex-col md:flex-row items-center gap-5 p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl hover:from-pink-100 hover:via-rose-100 hover:to-pink-100 transition-all duration-300 border-2 border-pink-200 hover:border-pink-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <div className="w-28 h-28 bg-white rounded-2xl overflow-hidden relative flex-shrink-0 shadow-md border border-pink-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🥧
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                      <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-pink-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mb-2">{item.category || 'Pia Popo'}</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                       {/* Qty Controls */}
                      <div className="flex items-center bg-white rounded-xl shadow-sm border-2 border-pink-200 overflow-hidden">
                        <button
                          className="w-12 h-10 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors font-bold text-xl active:bg-pink-200"
                          onClick={() => updateQty(item._id, -1)}
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-black text-lg text-gray-800 bg-pink-50/50 h-10 flex items-center justify-center">
                          {item.qty}
                        </span>
                        <button
                          className="w-12 h-10 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors font-bold text-xl active:bg-pink-200"
                          onClick={() => updateQty(item._id, +1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-3 text-red-500 bg-white hover:bg-red-50 rounded-xl transition-all duration-300 border-2 border-red-100 hover:border-red-300 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                        title="Hapus item"
                      >
                         🗑️
                      </button>
                    </div>

                    <div className="text-right w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-pink-200 pt-2 md:pt-0 md:pl-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Subtotal</p>
                      <p className="font-black text-xl text-pink-600">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg text-white text-xl">
                  🧾
                </div>
                <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                  Ringkasan Belanja
                </span>
              </h2>

              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-pink-200">
                <div className="flex justify-between items-center py-3 border-b border-pink-200 border-dashed">
                  <span className="text-gray-600 font-bold text-lg">Total Item</span>
                  <span className="font-bold text-xl text-gray-800">
                     {cart.length} <span className="text-sm text-gray-500 font-normal">produk</span>
                  </span>
                </div>

                <div className="pt-4 mt-2">
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
                className="w-full mt-8 py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl font-black text-xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
              >
                <span>Lanjut ke Pembayaran</span>
                <span className="text-2xl">👉</span>
              </button>

              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex gap-3 items-center">
                 <div className="text-2xl">🚚</div>
                 <p className="text-sm text-amber-800 font-bold">
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
        .animate-fade-in {
             animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}