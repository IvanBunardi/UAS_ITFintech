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
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Kembali</span>
        </button>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPath === '/admin' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">➕</span>
            Kelola Produk
          </button>
          <button
            onClick={() => router.push('/checkoutlist')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPath === '/checkoutlist' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">🛒</span>
            Pesanan
          </button>
          <button
            onClick={() => router.push('/statistik')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPath === '/statistik' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">📊</span>
            Statistik
          </button>
        </div>
      </nav>

      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Message Alert */}
          {message && (
            <div className={`rounded-xl p-4 border-2 ${getMessageStyle()} animate-fade-in`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {/* Form Section */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <span className="text-3xl">{editingId ? '✏️' : '➕'}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama produk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Harga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    min="0"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Deskripsikan produk Anda"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  rows={4}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Current Image Preview */}
              {editingId && currentImageUrl && !imageFile && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Gambar Saat Ini:</p>
                  <img 
                    src={currentImageUrl} 
                    alt="Current" 
                    className="w-40 h-40 object-cover rounded-lg shadow-md border-2 border-gray-200" 
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editingId ? 'Ganti Gambar (Opsional)' : 'Gambar Produk'} {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    id="imageFileInput"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full"
                    required={!editingId && !currentImageUrl}
                    disabled={submitting}
                  />
                  {imageFile && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <span className="text-xl">✓</span>
                      <span className="font-medium">{imageFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                  }`}
                >
                  <span className="mr-2">💾</span>
                  {submitting ? 'Menyimpan...' : editingId ? 'Update Produk' : 'Simpan Produk'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="px-6 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <span className="mr-2">✖️</span>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List Section */}
          <section className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-3">
                  <span className="text-3xl">📦</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Daftar Produk</h2>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-bold text-lg">{products.length} Produk</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Memuat data produk...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">Belum ada produk</p>
                <p className="text-gray-400 mt-2">Tambahkan produk pertama Anda di atas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                      editingId === p._id 
                        ? 'ring-4 ring-blue-500 bg-blue-50' 
                        : 'bg-white border-2 border-gray-100'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'
                        }}
                      />
                      {editingId === p._id && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          EDITING
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-xl text-gray-800 line-clamp-1">{p.name}</h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {p.category}
                        </span>
                      </div>

                      <p className="text-blue-600 font-bold text-2xl">{formatRupiah(p.price)}</p>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2.5 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                        >
                          <span className="mr-1">🗑️</span>
                          Hapus
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
    </div>
  )
}