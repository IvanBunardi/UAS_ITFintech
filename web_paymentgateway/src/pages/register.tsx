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
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E8] via-white to-[#FFE5EF] animate-fade" />

      {/* Floating icons */}
      <div className="absolute top-12 left-10 text-[#E88AA0] text-6xl select-none animate-float1">
        🍪
      </div>
      <div className="absolute bottom-10 right-10 text-[#D76A84] text-6xl select-none animate-float2">
        🧁
      </div>

      {/* HEADER */}
      <header className="flex items-center py-3 px-4 bg-transparent z-10 text-[#D76A84]">
        <button
          onClick={() => router.push('/')}
          className="mr-2 hover:opacity-70 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold drop-shadow">Pia Popo • Register</h1>
      </header>

      {/* FORM */}
      <main className="flex-grow flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-[#FFD4DD] shadow-xl animate-slideup">
          <h2 className="text-3xl font-bold text-[#D76A84] text-center">
            Daftar Akun
          </h2>
          <p className="text-[#6E4E4E] text-center mb-6">
            Daftar dulu yaa 🍰
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-[#FFD4DD] focus:ring-2 focus:ring-[#D76A84] outline-none bg-white/80 backdrop-blur"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-[#FFD4DD] focus:ring-2 focus:ring-[#D76A84] outline-none bg-white/80 backdrop-blur"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-[#FFD4DD] focus:ring-2 focus:ring-[#D76A84] outline-none bg-white/80 backdrop-blur"
              required
              minLength={6}
            />

            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-[#FFD4DD] focus:ring-2 focus:ring-[#D76A84] outline-none bg-white/80 backdrop-blur"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#D76A84] text-white font-medium hover:bg-[#C46C85] active:scale-[0.98] transition shadow-lg disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>

            <p className="text-center text-sm text-gray-700 pt-1">
              Sudah punya akun?{' '}
              <span
                onClick={() => router.push('/login')}
                className="text-[#D76A84] hover:underline cursor-pointer"
              >
                Login sekarang
              </span>
            </p>
          </form>

          {message && (
            <div
              className={`mt-4 p-2 text-center rounded-lg text-sm ${
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

      <footer className="text-center text-[#B56A7D] py-4 text-sm z-10">
        © {new Date().getFullYear()} Pia Popo • Semua hak dilindungi.
      </footer>

      {/* ANIMATIONS */}
      <style jsx>{`
        .animate-fade {
          animation: fadein 0.8s ease forwards;
        }
        .animate-slideup {
          animation: slideup 0.7s ease forwards;
        }
        .animate-float1 {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 5s ease-in-out infinite;
        }

        /* Fade In */
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Slide Up */
        @keyframes slideup {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Float Emoji Left */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }

        /* Float Emoji Right */
        @keyframes float2 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(18px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
