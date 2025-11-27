// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl: string
}

type MessageType = 'success' | 'error' | 'loading' | ''

export default function AdminPage() {
  // Form States
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // UI States
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  
  const router = useRouter()
  const currentPath = router.pathname

  const categories = ['Drinks', 'Snacks', 'Food', 'Clothes', 'Bundle']

  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/product')
      
      if (!res.ok) throw new Error('Gagal mengambil data produk')
      
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      console.error('Error fetching products:', err)
      showMessage('Gagal memuat produk', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submitting) return
    
    setSubmitting(true)
    showMessage('Menyimpan...', 'loading')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('description', description)

    if (imageFile) {
      formData.append('image', imageFile)
    } else if (editingId && currentImageUrl) {
      formData.append('imageUrl', currentImageUrl)
    }

    try {
      const url = editingId ? `/api/product?id=${editingId}` : '/api/product'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: formData,
      })

      const result = await res.json()

      if (res.ok) {
        showMessage(
          editingId ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!',
          'success'
        )
        resetForm()
        await fetchProducts()
      } else {
        showMessage(`Gagal: ${result.error || 'Terjadi kesalahan'}`, 'error')
      }
    } catch (error) {
      console.error('Submit Error:', error)
      showMessage('Gagal menyimpan produk', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit product
  const handleEdit = (product: Product) => {
    setEditingId(product._id)
    setName(product.name)
    setCategory(product.category)
    setPrice(product.price.toString())
    setDescription(product.description)
    
    // SUDAH DIPERBAIKI (sebelumnya setImageUrl)
    setCurrentImageUrl(product.imageUrl)
    
    setImageFile(null)
    setMessage('')
    setMessageType('')

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const res = await fetch(`/api/product?id=${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (res.ok) {
        showMessage('Produk berhasil dihapus!', 'success')
        await fetchProducts()
      } else {
        showMessage(`Gagal menghapus: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Delete Error:', error)
      showMessage('Gagal menghapus produk', 'error')
    }
  }

  // Reset form
  const resetForm = () => {
    setName('')
    setCategory('')
    setPrice('')
    setDescription('')
    setImageFile(null)
    setEditingId(null)
    
    // SUDAH DIPERBAIKI (sebelumnya setImageUrl)
    setCurrentImageUrl('')

    if (typeof document !== 'undefined') {
      const fileInput = document.getElementById('imageFileInput') as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
    }
  }

  // Show message with auto-hide
  const showMessage = (msg: string, type: MessageType) => {
    setMessage(msg)
    setMessageType(type)
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    }
  }

  // Format price to Rupiah
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  // Get message styling
  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'loading':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 font-sans">
      
      {/* Decorative circles (Blobs) */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-40 left-10 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl py-4 px-8 flex items-center justify-between sticky top-0 z-50 border-b-4 border-pink-400">
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Kembali</span>
        </button>

        <div className="flex flex-col items-center">
             <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Admin Dashboard
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest">PIA POPO MANAGEMENT</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin')}
            className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
              currentPath === '/admin' 
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <span className="mr-2">➕</span>
            Produk
          </button>
          
          <button
            onClick={() => router.push('/checkoutlist')}
            className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
              currentPath === '/checkoutlist' 
                 ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <span className="mr-2">🛒</span>
            Pesanan
          </button>

          <button
            onClick={() => router.push('/statistik')}
             className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
              currentPath === '/statistik' 
                 ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <span className="mr-2">📊</span>
            Statistik
          </button>
        </div>
      </nav>

      <main className="flex-grow p-6 z-10 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Message Alert */}
          {message && (
            <div className={`rounded-2xl p-4 border-2 shadow-md ${getMessageStyle()} animate-fade-in`}>
              <p className="text-center font-bold">{message}</p>
            </div>
          )}

          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border-2 border-pink-200">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-pink-100 p-3 rounded-full mr-3 animate-pulse">
                <span className="text-3xl">{editingId ? '✏️' : '🥧'}</span>
              </div>
              <h2 className="text-3xl font-black text-gray-800">
                {editingId ? 'Edit Varian Pia' : 'Tambah Pia Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Produk <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pia Rasa Coklat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all font-medium bg-white/50"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kategori <span className="text-pink-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all font-medium bg-white/50"
                  required
                  disabled={submitting}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Harga <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-3.5 text-pink-500 font-bold">Rp</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-14 pr-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all font-medium bg-white/50"
                    required
                    min="0"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deskripsi <span className="text-pink-500">*</span>
                </label>
                <textarea
                  placeholder="Ceritakan kelezatan pia ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all resize-none font-medium bg-white/50"
                  rows={4}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Current Image Preview */}
              {editingId && currentImageUrl && !imageFile && (
                <div className="border-2 border-dashed border-pink-300 rounded-2xl p-4 bg-pink-50/50">
                  <p className="text-sm font-bold text-pink-600 mb-3">Gambar Saat Ini:</p>
                  <img 
                    src={currentImageUrl} 
                    alt="Current" 
                    className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-white rotate-2 hover:rotate-0 transition-all duration-300" 
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {editingId ? 'Ganti Gambar (Opsional)' : 'Gambar Produk'} {!editingId && <span className="text-pink-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-pink-300 rounded-2xl p-6 bg-pink-50/30 hover:bg-pink-50 transition-colors group cursor-pointer text-center">
                  <input
                    type="file"
                    accept="image/*"
                    id="imageFileInput"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                    required={!editingId && !currentImageUrl}
                    disabled={submitting}
                  />
                  {imageFile && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                      <span className="text-xl">✨</span>
                      <span className="font-bold">{imageFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-200 shadow-lg ${
                    submitting
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <span className="mr-2">{submitting ? '⏳' : '💾'}</span>
                  {submitting ? 'Menyimpan...' : editingId ? 'Update Produk' : 'Simpan Produk'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">❌</span>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List Section */}
          <section className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border-2 border-pink-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full mr-3">
                  <span className="text-3xl">📦</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800">Daftar Produk</h2>
              </div>
              <div className="bg-pink-100 px-5 py-2 rounded-2xl border border-pink-200">
                <span className="text-pink-700 font-bold text-lg">{products.length} Items</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mb-4"></div>
                <p className="text-gray-500 font-bold">Mengambil data pia...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-pink-100">
                <div className="text-8xl mb-4 animate-bounce">🥧</div>
                <p className="text-gray-500 text-xl font-medium">Belum ada produk pia</p>
                <p className="text-pink-400 mt-2 font-medium">Tambahkan produk pertama Anda di atas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className={`group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative ${
                      editingId === p._id 
                        ? 'ring-4 ring-pink-400 bg-pink-50' 
                        : 'bg-white border-2 border-pink-100 hover:border-pink-300'
                    }`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000 pointer-events-none z-20"></div>

                    {/* Product Image */}
                    <div className="relative h-56 bg-gradient-to-br from-pink-100 to-amber-100 overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'
                        }}
                      />
                      {editingId === p._id && (
                        <div className="absolute top-3 right-3 bg-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                          EDITING
                        </div>
                      )}
                      
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-lg z-10">
                        {p.category}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-xl text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors">{p.name}</h3>

                      <p className="font-black text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {formatRupiah(p.price)}
                      </p>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed h-10">
                        {p.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-3 rounded-2xl transition-all duration-200 font-bold border border-amber-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-3 rounded-2xl transition-all duration-200 font-bold border border-red-200"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Styles for animation */}
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
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}