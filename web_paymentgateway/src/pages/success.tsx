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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {updating ? (
          // Loading State
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Memproses Pembayaran...
            </h1>
            <p className="text-gray-600 text-center">
              Mohon tunggu sebentar
            </p>
          </>
        ) : error ? (
          // Error State
          <>
            <div className="bg-red-100 rounded-full p-6 mb-6 mx-auto w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">
              Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Kembali
              </button>
              <button
                onClick={() => router.reload()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </>
        ) : (
          // Success State
          <>
            <div className="bg-green-100 rounded-full p-6 mb-6 mx-auto w-fit animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Pembayaran Berhasil! 🎉
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Terima kasih, pembayaran Anda telah diterima dan order sedang diproses.
            </p>

            {(invoice_number || invoice_id) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Nomor Invoice:</p>
                <p className="text-lg font-bold text-blue-600">
                  {invoice_number || invoice_id}
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg hover:shadow-xl"
            >
              Kembali ke Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}