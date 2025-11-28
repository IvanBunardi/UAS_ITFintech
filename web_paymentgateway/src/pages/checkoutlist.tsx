// @ts-nocheck
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminCheckoutPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const router = useRouter()
  const currentPath = router.pathname

  // 🔹 Ambil data order dari API
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/order')
      if (!res.ok) throw new Error('Gagal mengambil data order')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Gagal memuat data order')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Update status order
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/order?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Gagal update status')
      setMessage('✅ Status berhasil diupdate!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Gagal update status')
    }
  }

  // 🔹 Hapus order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Yakin ingin menghapus order ini?')) return

    try {
      const res = await fetch(`/api/order?id=${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus order')
      setMessage('🗑️ Order berhasil dihapus!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Gagal menghapus order')
    }
  }

  // 🔹 Format ke Rupiah
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)

  // 🔹 Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 🔹 Tampilan badge status (Styled)
  const getStatusBadge = (status: string) => {
    const config: any = {
      waiting_payment: { bg: 'bg-amber-100 text-amber-700 border-amber-200', label: '⏳ Menunggu Pembayaran' },
      paid: { bg: 'bg-green-100 text-green-700 border-green-200', label: '✅ Lunas' },
      cancelled: { bg: 'bg-red-100 text-red-700 border-red-200', label: '❌ Dibatalkan' },
    }
    const c = config[status] || config.waiting_payment
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.bg} shadow-sm`}>{c.label}</span>
  }

  // 🔹 Filter order sesuai status
  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  // 🔹 Statistik ringkasan
  const stats = {
    total: orders.length,
    waiting: orders.filter((o) => o.status === 'waiting_payment').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }

  // ============================== RENDER ==============================
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 font-sans text-gray-800">
        
       {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-40 left-10 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* 🔹 Navbar */}
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
                Order Management
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest">DAFTAR PESANAN MASUK</p>
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

      {/* 🔹 Main Content */}
      <main className="flex-grow p-6 z-10 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatBox label="Total Order" value={stats.total} icon="📦" color="text-blue-600" />
            <StatBox label="Menunggu" value={stats.waiting} icon="⏳" color="text-amber-600" />
            <StatBox label="Lunas" value={stats.paid} icon="✅" color="text-green-600" />
            <StatBox label="Dibatalkan" value={stats.cancelled} icon="❌" color="text-red-600" />
            <StatBox label="Pendapatan" value={formatRupiah(stats.revenue)} icon="💰" color="text-pink-600" />
          </div>

          {/* Pesan Sukses/Error */}
          {message && (
            <div
              className={`p-4 rounded-2xl text-center font-bold shadow-md animate-bounce ${
                message.includes('❌') 
                    ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                    : 'bg-green-100 text-green-700 border-2 border-green-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Filter Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-pink-100 flex flex-wrap items-center gap-4">
            <span className="font-bold text-gray-700 flex items-center gap-2">
                <span>🔍</span> Filter Status:
            </span>
            {[
              { key: 'all', label: 'Semua', count: stats.total, color: 'blue' },
              { key: 'waiting_payment', label: 'Menunggu', count: stats.waiting, color: 'yellow' },
              { key: 'paid', label: 'Lunas', count: stats.paid, color: 'green' },
              { key: 'cancelled', label: 'Batal', count: stats.cancelled, color: 'red' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilterStatus(btn.key)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                  filterStatus === btn.key
                    ? `bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md transform scale-105`
                    : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
                }`}
              >
                {btn.label} <span className="ml-1 text-xs opacity-80 bg-black/20 px-2 py-0.5 rounded-full">{btn.count}</span>
              </button>
            ))}
          </div>

          {/* Daftar Order */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
            <div className="p-6 border-b border-pink-100 bg-pink-50/50">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <span>📋</span> Daftar Transaksi
              </h2>
            </div>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mb-4"></div>
                <p className="text-gray-500 font-bold">Memuat pesanan...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
               <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 font-bold">Tidak ada data order.</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    expandedOrder={expandedOrder}
                    setExpandedOrder={setExpandedOrder}
                    formatDate={formatDate}
                    formatRupiah={formatRupiah}
                    getStatusBadge={getStatusBadge}
                    updateOrderStatus={updateOrderStatus}
                    deleteOrder={deleteOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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
      `}</style>
    </div>
  )
}

// ===================== Komponen Tambahan (Styled) =====================

function StatBox({ label, value, color, icon }: { label: string; value: any; color: string; icon: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-pink-100 hover:border-pink-300 transition-all duration-300">
      <div className="flex justify-between items-start">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
          <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-black mt-2 truncate ${color}`}>{value}</p>
    </div>
  )
}

function OrderCard({
  order,
  expandedOrder,
  setExpandedOrder,
  formatDate,
  formatRupiah,
  getStatusBadge,
  updateOrderStatus,
  deleteOrder,
}: any) {
  return (
    <div className="p-6 hover:bg-pink-50/40 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-sm border border-blue-100">
                #{order.orderNumber}
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
             <span>👤 {order.customerName}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
             📱 {order.customerPhone} {order.customerEmail && ` • ✉️ ${order.customerEmail}`}
          </p>
          <p className="text-xs text-gray-400 mt-2 font-bold flex items-center gap-1">
             🕐 {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-left md:text-right bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Total Pembayaran</p>
          <p className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            {formatRupiah(order.totalAmount)}
          </p>
          <p className="text-xs text-gray-500 font-bold mt-1">{order.items.length} item(s)</p>
        </div>
      </div>

      <button
        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
        className="text-pink-600 hover:text-pink-700 font-bold text-sm mb-3 flex items-center gap-1 transition-colors"
      >
        {expandedOrder === order._id ? '🔼 Sembunyikan Detail' : '🔽 Lihat Detail Produk'}
      </button>

      {expandedOrder === order._id && (
        <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-pink-100 shadow-inner space-y-3">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64?text=Pia'
                      }}
                    />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🥧</div>
                  )}
              </div>
              
              <div className="flex-1">
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500 font-medium bg-gray-200 inline-block px-2 py-0.5 rounded mt-1">
                    {item.category || 'Pia Popo'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gray-600">{item.quantity} x</p>
                <p className="text-xs text-gray-500">{formatRupiah(item.price)}</p>
              </div>
              
              <div className="text-right w-24">
                <p className="font-black text-pink-600">{formatRupiah(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          
          {order.notes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg mt-3">
              <p className="text-xs font-bold text-yellow-700 uppercase">📝 Catatan Customer:</p>
              <p className="text-sm text-gray-700 font-medium italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-pink-100">
        {order.status === 'waiting_payment' && (
          <>
            <button
              onClick={() => updateOrderStatus(order._id, 'paid')}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition font-bold text-sm"
            >
              ✅ Tandai Lunas
            </button>
            <button
              onClick={() => updateOrderStatus(order._id, 'cancelled')}
              className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition font-bold text-sm"
            >
              ❌ Batalkan
            </button>
          </>
        )}
        {order.status === 'paid' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'cancelled')}
            className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition font-bold text-sm"
          >
            ❌ Batalkan Pesanan
          </button>
        )}
        {order.status === 'cancelled' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'waiting_payment')}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl hover:bg-yellow-200 transition font-bold text-sm"
          >
            🔄 Kembalikan ke Menunggu
          </button>
        )}
        <button
          onClick={() => deleteOrder(order._id)}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-bold text-sm ml-auto border border-gray-200"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  )
}