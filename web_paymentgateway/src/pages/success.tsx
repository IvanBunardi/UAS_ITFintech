import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const { invoice_number, invoice_id } = router.query;
  const [updating, setUpdating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get invoice from query params (DOKU returns this)
    const invoice = invoice_number || invoice_id;
    
    if (!invoice) {
      setUpdating(false);
      return;
    }

    // Call mark-paid API
    const markAsPaid = async () => {
      try {
        const response = await fetch("/api/mark-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update order");
        }

        console.log("Order updated successfully:", data);
        setUpdating(false);
      } catch (err: any) {
        console.error("Error updating order:", err);
        setError(err.message);
        setUpdating(false);
      }
    };

    markAsPaid();
  }, [invoice_number, invoice_id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 p-4 relative overflow-hidden">
      
      {/* Decorative circles */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-40 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-pink-200 relative z-10">
        {updating ? (
          // Loading State
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-pink-500"></div>
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Memproses Pembayaran...
            </h1>
            <p className="text-gray-600 font-medium">
              Mohon tunggu, kami sedang memverifikasi transaksi Anda.
            </p>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6 mx-auto w-fit animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-red-600 mb-2">
              Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-8 font-medium bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Kembali
              </button>
              <button
                onClick={() => router.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition font-bold shadow-lg"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          // Success State
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-6 mb-6 mx-auto w-fit shadow-xl transform hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-2">
              Pembayaran Berhasil! 🎉
            </h1>
            
            <p className="text-gray-600 mb-6 font-medium">
              Terima kasih telah berbelanja di Pia Popo.
            </p>

            {/* INFO PENTING UNTUK USER */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 text-left rounded-r-xl shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                    <p className="font-bold text-amber-800 text-sm uppercase tracking-wide">Info Pengiriman</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        Pesanan Anda sudah masuk sistem kami. <strong>Admin kami akan segera menghubungi Anda melalui WhatsApp</strong> untuk konfirmasi pengiriman paket.
                    </p>
                </div>
              </div>
            </div>

            {(invoice_number || invoice_id) && (
              <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nomor Invoice</p>
                <p className="text-xl font-mono font-black text-pink-600">
                  {invoice_number || invoice_id}
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            >
              Kembali ke Beranda
            </button>
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