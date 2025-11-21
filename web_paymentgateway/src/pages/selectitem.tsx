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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-30 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-amber-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-amber-900">Menu</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-amber-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="p-6 flex flex-col gap-4">
          <button
            className="text-left px-4 py-3 rounded-lg hover:bg-amber-50 text-gray-700 hover:text-amber-900 transition-colors flex items-center gap-3"
            onClick={() => router.push("/")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </nav>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors" 
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="font-bold text-2xl text-amber-900">🥧 Toko Pia</h1>
                <p className="text-xs text-amber-600">Pia Tradisional Berkualitas</p>
              </div>
            </div>

            <button
              className="relative px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={goCheckout}
              disabled={cart.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">Keranjang</span>
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {cart.length > 0 && (
          <div className="px-6 pb-3">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-amber-900">Total Belanja:</span>
              <span className="font-bold text-lg text-amber-900">Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Produk Kami</h2>
          <p className="text-gray-600">Pilih pia favorit Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100"
            >
              <div className="relative w-full h-56 bg-gradient-to-br from-amber-100 to-orange-100">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🥧</div>
                      <span className="text-amber-600 text-sm">No Image</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {p.description || "Pia lezat dengan kualitas terbaik"}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-gray-500">Harga</span>
                    <p className="text-xl font-bold text-amber-600">
                      Rp {p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                 {/*  {p.category && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                      {p.category}
                    </span>
                  )} */}
                </div>

                {cart.find((item) => item._id === p._id) ? (
                  <div className="flex items-center justify-between bg-amber-50 rounded-xl p-3">
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
                      className="w-10 h-10 rounded-full bg-white border-2 border-amber-300 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="font-bold text-lg text-amber-900">
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
                      className="w-10 h-10 rounded-full bg-white border-2 border-amber-300 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => add(p)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah ke Keranjang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}