// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
} from 'recharts'

// Wrapper untuk Legend supaya TypeScript/JSX tidak error pada recharts@3.x
const LegendWrapper: React.FC<any> = (props) => {
  return React.createElement(RechartsLegend as any, props)
}

// ----------------------
// Page component
// ----------------------
export default function StatistikPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const router = useRouter()
  const currentPath = router.pathname

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
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  // Filter orders by date range
  const filterOrdersByDate = () => {
    if (dateRange === 'all') return orders
    const now = new Date()
    const cutoffDate = new Date()
    switch (dateRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
    }
    return orders.filter((order) => new Date(order.createdAt) >= cutoffDate)
  }

  const filteredOrders = filterOrdersByDate()

  // Stats
  const paidOrders = filteredOrders.filter((o) => o.status === 'paid')
  const waitingOrders = filteredOrders.filter((o) => o.status === 'waiting_payment')
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled')

  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    paidOrders: paidOrders.length,
    waitingOrders: waitingOrders.length,
    cancelledOrders: cancelledOrders.length,
    averageOrderValue:
      paidOrders.length > 0 ? paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / paidOrders.length : 0,
  }

  // Daily Revenue Data (for Line Chart)
  const getDailyRevenueData = () => {
    const dailyData: { [key: string]: number } = {}

    paidOrders.forEach((order) => {
      const d = new Date(order.createdAt)
      if (isNaN(d.getTime())) return
      const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      dailyData[date] = (dailyData[date] || 0) + (order.totalAmount || 0)
    })

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14)
  }

  // Top Products (for Bar Chart)
  const getTopProducts = () => {
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

    paidOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : []
      items.forEach((item: any) => {
        const name = item.name ?? 'Unknown'
        if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 }
        productSales[name].quantity += item.quantity || 0
        productSales[name].revenue += (item.price || 0) * (item.quantity || 0)
      })
    })

    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }

  // Order Status Distribution (for Pie Chart)
  const getOrderStatusData = () => [
    { name: 'Lunas', value: stats.paidOrders, color: '#ec4899' }, // Pink-500
    { name: 'Menunggu', value: stats.waitingOrders, color: '#f59e0b' }, // Amber-500
    { name: 'Batal', value: stats.cancelledOrders, color: '#9ca3af' }, // Gray-400
  ]

  // Custom label renderer dengan safe check
  const renderPieLabel = ({ name, percent }: any) => {
    const percentValue = typeof percent === 'number' && !isNaN(percent) ? percent : 0
    const displayPercent = (percentValue * 100).toFixed(0)
    return `${name}: ${displayPercent}%`
  }

  const dailyRevenueData = getDailyRevenueData()
  const topProductsData = getTopProducts()
  const orderStatusData = getOrderStatusData()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 font-sans text-gray-800">
      
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
                Analytics
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest">DATA PENJUALAN PIA</p>
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

      {/* Main Content */}
      <main className="flex-grow p-6 z-10 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-pink-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <span className="font-bold text-gray-700">Periode Data:</span>
            </div>
            <div className="flex gap-2 bg-pink-50 p-1 rounded-xl">
              {['7d', '30d', '90d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as any)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                    dateRange === range 
                      ? 'bg-white text-pink-600 shadow-md transform scale-105' 
                      : 'text-gray-500 hover:text-pink-500'
                  }`}
                >
                  {range === '7d' ? '7 Hari' : range === '30d' ? '30 Hari' : range === '90d' ? '90 Hari' : 'Semua'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-2xl">
                    <span className="text-2xl">💰</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Revenue</span>
              </div>
              <p className="text-gray-500 text-sm font-bold">Total Pendapatan</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-2 font-semibold">dari {stats.paidOrders} transaksi sukses</p>
            </div>

            {/* Avg Order Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                    <span className="text-2xl">⚖️</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Average</span>
              </div>
              <p className="text-gray-500 text-sm font-bold">Rata-rata Order</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.averageOrderValue)}</p>
              <p className="text-xs text-gray-400 mt-2 font-semibold">per keranjang belanja</p>
            </div>

            {/* Total Order Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-2xl">
                    <span className="text-2xl">🧾</span>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Volume</span>
              </div>
              <p className="text-gray-500 text-sm font-bold">Total Transaksi</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{stats.totalOrders}</p>
              <p className="text-xs text-gray-400 mt-2 font-semibold">dalam periode ini</p>
            </div>

            {/* Success Rate Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-pink-100 p-3 rounded-2xl">
                    <span className="text-2xl">🎯</span>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-lg">Conversion</span>
              </div>
              <p className="text-gray-500 text-sm font-bold">Success Rate</p>
              <p className="text-2xl font-black text-gray-800 mt-1">
                {stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}%
              </p>
              <p className="text-xs text-pink-500 mt-2 font-semibold">tingkat pembayaran berhasil</p>
            </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mb-4"></div>
                <p className="text-gray-500 font-bold">Sedang menganalisis data...</p>
              </div>
          ) : (
            <>
              {/* Charts Section 1: Line Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-pink-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-pink-100 p-2 rounded-lg">📈</div>
                    <h2 className="text-xl font-black text-gray-800">Tren Pendapatan Harian</h2>
                </div>
                
                {dailyRevenueData.length > 0 ? (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <YAxis 
                            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [formatRupiah(value), 'Pendapatan']} 
                        />
                        <LegendWrapper />
                        <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#ec4899" 
                            strokeWidth={4} 
                            dot={{ fill: '#ec4899', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 8 }}
                            name="Pendapatan" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-pink-50/50 rounded-2xl">
                    <p className="text-gray-500 font-medium">Belum ada data pendapatan untuk ditampilkan</p>
                  </div>
                )}
              </div>

              {/* Charts Section 2: Bar & Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-pink-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">🏆</div>
                    <h2 className="text-xl font-black text-gray-800">Top 10 Produk Terlaris</h2>
                  </div>

                  {topProductsData.length > 0 ? (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProductsData} layout="vertical" barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120} 
                            tick={{fontSize: 11, fill: '#4b5563', fontWeight: 600}} 
                          />
                          <Tooltip 
                             cursor={{fill: '#fce7f3'}}
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                             formatter={(value: number) => [formatRupiah(value), 'Omset']}
                          />
                          <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[0, 10, 10, 0]}>
                             {/* Gradient Definition inside SVG */}
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-pink-50/50 rounded-2xl">
                        <p className="text-gray-500 font-medium">Belum ada data produk terjual</p>
                    </div>
                  )}
                </div>

                {/* Order Status */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-pink-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg">🚦</div>
                    <h2 className="text-xl font-black text-gray-800">Status Pesanan</h2>
                  </div>

                  {orderStatusData.some((d) => d.value > 0) ? (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={renderPieLabel}
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <LegendWrapper />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-pink-50/50 rounded-2xl">
                        <p className="text-gray-500 font-medium">Belum ada data status</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
                <div className="p-6 border-b border-pink-100 bg-pink-50/50">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <span>📋</span> Detail Performa Produk
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-pink-100/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">No</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">Produk</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">Terjual</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {topProductsData.length > 0 ? (
                        topProductsData.map((product, index) => (
                          <tr key={index} className="hover:bg-pink-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-400">
                                #{index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-gray-800">{product.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                {product.quantity} unit
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-pink-600">
                              {formatRupiah(product.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                            Belum ada data penjualan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}