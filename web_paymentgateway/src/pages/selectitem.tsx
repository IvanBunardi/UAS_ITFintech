import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  qty?: number;
}

export default function UserPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.qty || 0)), 0);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/product")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  function add(p: Product) {
    const c = [...cart];
    const idx = c.findIndex((x) => x._id === p._id);
    if (idx > -1) {
      c[idx].qty = (c[idx].qty || 1) + 1;
    } else {
      c.push({ ...p, qty: 1 });
    }
    setCart(c);
  }

  function goCheckout() {
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/checkout");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 relative overflow-x-hidden">
      {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-40 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-30 transform transition-all duration-500 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b-2 border-pink-100 bg-gradient-to-br from-pink-50 to-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-1">Menu</h2>
                <p className="text-xs text-gray-500">Pia Popo Store</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-pink-600 transition-all hover:rotate-90 duration-300"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <button
                className="w-full text-left px-5 py-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 text-gray-700 hover:text-pink-700 transition-all duration-300 flex items-center gap-3 group border-2 border-transparent hover:border-pink-200"
                onClick={() => router.push("/")}
              >
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="font-semibold">Keluar</span>
              </button>
            </div>
          </nav>

          <div className="p-6 border-t-2 border-pink-100 bg-gradient-to-br from-white to-pink-50">
            <div className="text-center">
              <div className="text-4xl mb-2">🥧</div>
              <p className="text-xs font-semibold text-gray-600">PIA LEGENDARIS</p>
              <p className="text-xs text-gray-500">PONTIANAK</p>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white/90 backdrop-blur-lg shadow-xl sticky top-0 z-10 border-b-4 border-pink-400">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="p-2.5 hover:bg-pink-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95" 
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="font-black text-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  🥧 Pia Popo
                </h1>
                <p className="text-xs font-bold text-gray-600 tracking-wide">PIA LEGENDARIS PONTIANAK</p>
              </div>
            </div>

            <button
              className="relative px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold transform hover:scale-105 active:scale-95"
              onClick={goCheckout}
              disabled={cart.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-lg">Keranjang</span>
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-black shadow-lg animate-bounce border-3 border-white">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {cart.length > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 rounded-2xl px-6 py-3 flex items-center justify-between border-2 border-pink-300 shadow-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-bold text-pink-800">Total Belanja:</span>
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-6 relative">
        <div className="mb-10 text-center py-8">
          <div className="inline-block mb-4">
            <div className="text-7xl animate-bounce">🥧</div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
            Produk Pilihan Kami
          </h2>
          <p className="text-gray-600 text-lg font-medium">Pilih pia legendaris favorit Anda ❤️✨</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
            <div className="h-1 w-8 bg-pink-400 rounded-full"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-pink-200 hover:border-pink-400 transform hover:-translate-y-2 relative"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
              
              <div className="relative w-full h-64 bg-gradient-to-br from-pink-100 via-rose-100 to-amber-100 overflow-hidden">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                      <div className="text-7xl mb-3 animate-pulse">🥧</div>
                      <span className="text-pink-600 text-sm font-bold bg-white px-4 py-1 rounded-full shadow-md">No Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-lg">
                  ⭐ Premium
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {p.description || "Pia lezat dengan kualitas terbaik"}
                </p>
                
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Harga</span>
                    <p className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      Rp {p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                 {/*  {p.category && (
                    <span className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-xs rounded-full font-bold border-2 border-pink-200 shadow-sm">
                      {p.category}
                    </span>
                  )} */}
                </div>

                {cart.find((item) => item._id === p._id) ? (
                  <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-4 border-2 border-pink-300 shadow-inner">
                    <button
                      onClick={() => {
                        const c = [...cart];
                        const idx = c.findIndex((x) => x._id === p._id);
                        if (idx > -1 && c[idx].qty && c[idx].qty > 1) {
                          c[idx].qty!--;
                        } else {
                          c.splice(idx, 1);
                        }
                        setCart(c);
                      }}
                      className="w-12 h-12 rounded-full bg-white border-3 border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center font-black text-xl shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                    >
                      −
                    </button>
                    <span className="font-black text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent px-4">
                      {cart.find((item) => item._id === p._id)?.qty}
                    </span>
                    <button
                      onClick={() => {
                        const c = [...cart];
                        const idx = c.findIndex((x) => x._id === p._id);
                        if (idx > -1) {
                          c[idx].qty = (c[idx].qty || 1) + 1;
                        }
                        setCart(c);
                      }}
                      className="w-12 h-12 rounded-full bg-white border-3 border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center font-black text-xl shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => add(p)}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 font-bold text-base shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 group"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah ke Keranjang</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-pulse">🥧</div>
            <p className="text-gray-500 text-lg font-medium">Produk sedang dimuat...</p>
          </div>
        )}
      </main>

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