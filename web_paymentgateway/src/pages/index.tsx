import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl?: string
  qty?: number
}

export default function LandingPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  // ambil data produk
  useEffect(() => {
    fetch('/api/product')
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Gagal ambil produk:', err))
  }, [])

  const categories = ['All', 'Drinks', 'Snacks', 'Food', 'Clothes', 'Bundle']

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filter === 'All' || p.category === filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // ✅ Fungsi Add to Cart - selalu tampilkan alert login
  function addToCart(p: Product) {
    alert('Silakan login terlebih dahulu')
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-40 left-10 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Navbar */}
      <header className="flex justify-between items-center py-5 px-8 bg-white/90 backdrop-blur-lg shadow-xl z-10 border-b-4 border-pink-400 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="text-5xl">🥧</div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Pia Popo
            </h1>
            <p className="text-xs font-bold text-gray-600 tracking-wide">PIA LEGENDARIS PONTIANAK</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="text-pink-600 hover:text-pink-700 font-bold transition-all duration-300 px-4 py-2 rounded-xl hover:bg-pink-50"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold px-6 py-3 rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
          >
            Register
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 md:px-16 py-20 z-10 relative">
        <div className="mb-8 animate-bounce">
          <div className="text-9xl">🥧</div>
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
            Pia Legendaris
          </span>
          <br />
          <span className="text-gray-800">dari Pontianak</span>
        </h2>

        <p className="text-gray-700 text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Nikmati kelezatan pia tradisional dengan berbagai varian rasa pilihan. 
          <br />
          <span className="text-pink-600 font-bold">Order sekarang dan rasakan kenikmatannya! ✨</span>
        </p>

        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
          <div className="h-1 w-8 bg-pink-400 rounded-full"></div>
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold px-10 py-4 rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 text-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Masuk ke Akun
          </button>
          <button
            onClick={() => router.push('/register')}
            className="border-4 border-pink-500 text-pink-600 font-bold px-10 py-4 rounded-2xl hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Buat Akun Baru
          </button>
        </div>

        {/* Produk Section */}
        <section className="w-full max-w-7xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl py-12 px-6 md:px-12 border-2 border-pink-200">
          <div className="mb-10 text-center">
            <h3 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
              🛍️ Katalog Produk
            </h3>
            <p className="text-gray-600 text-lg font-medium">Pilih pia favorit Anda</p>
          </div>

          {/* Filter dan Search */}
         {/*  <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filter === c
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2 border-pink-300 rounded-2xl px-5 py-3 w-full focus:outline-none focus:border-pink-500 transition-colors font-medium"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div> */}

          {/* Daftar Produk */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="group bg-white border-2 border-pink-200 rounded-3xl shadow-lg hover:shadow-2xl p-5 transition-all duration-500 hover:border-pink-400 transform hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>

                <div className="w-full h-44 relative mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-amber-100">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                        <div className="text-6xl mb-2 animate-pulse">🥧</div>
                        <span className="text-pink-600 text-xs font-bold bg-white px-3 py-1 rounded-full shadow-md">No Image</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-lg">
                    ⭐ Premium
                  </div>
                </div>

                <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">{p.name}</h4>
                <p className="text-xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  Rp {p.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                  {p.description || 'Tidak ada deskripsi'}
                </p>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold py-3 rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-pulse">🥧</div>
              <p className="text-gray-500 text-lg font-medium">Produk tidak ditemukan</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative text-center bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 py-8 text-white z-10 mt-20 border-t-4 border-pink-300">
        <div>
          <div className="text-5xl mb-2">🥧</div>
          <p className="font-black text-2xl tracking-tight">Pia Popo</p>
          <p className="text-xs font-bold opacity-90 tracking-wide">PIA LEGENDARIS PONTIANAK</p>
        </div>
      </footer>

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
  )
}