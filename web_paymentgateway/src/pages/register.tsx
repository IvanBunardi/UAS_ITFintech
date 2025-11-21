import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', whatsapp: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    if (res.ok) {
      setMessage("Akun berhasil dibuat! Mengalihkan ke login...");
      setTimeout(() => router.push("/login"), 1500);
    }
  } catch {
    setMessage("Terjadi kesalahan. Silakan coba lagi.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex items-center py-3 px-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.push('/')}
          className="text-gray-700 hover:text-gray-900 mr-2"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">XenditPay</h1>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Bergabung dengan XenditPay sekarang
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              minLength={6}
            />
            <input
              type="tel"
              placeholder="+628123456789"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Sudah punya akun?{' '}
              <span
                onClick={() => router.push('/login')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login sekarang
              </span>
            </p>
          </form>

          {message && (
            <div
              className={`mt-3 p-2 rounded-md text-center text-sm ${
                message.includes('berhasil')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center bg-black py-4 text-white/80 text-sm z-10">
        © {new Date().getFullYear()} IT IN FINTECH Payment Gateway. All rights reserved.
      </footer>
    </div>
  );
}
