import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        setMessage('Login berhasil! Mengalihkan...');
        const redirectTo = data.redirectTo || '/selectitem';
        setTimeout(() => router.push(redirectTo), 1500);
      } else {
        setMessage(data.error || 'Email atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E8] via-[#FFECF3] to-[#FFE7DE] animate-fade" />

      {/* Sprinkles / Little Candy Dots */}
      <div className="sprinkle"></div>
      <div className="sprinkle2"></div>
      <div className="sprinkle3"></div>

      {/* Floating Dessert Emojis */}
      <div className="absolute top-10 left-8 text-[#F4A7B9] text-7xl select-none animate-float1">
        🍩
      </div>
      <div className="absolute bottom-16 right-12 text-[#D76A84] text-7xl select-none animate-float2">
        🧁
      </div>

      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-4 text-[#D76A84] z-10">
        <button onClick={() => router.push('/')}>
          <ArrowLeft size={22} className="hover:opacity-70 transition" />
        </button>
        <span className="text-lg font-semibold tracking-wide drop-shadow-sm">
          Pia Popo • Login
        </span>
      </header>

      {/* Form */}
      <main className="flex flex-grow items-center justify-center px-4 z-10">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/80 backdrop-blur-2xl shadow-2xl border border-[#FFCFDB] animate-slideup sweet-card">
          <h2 className="text-3xl font-extrabold text-[#D76A84] text-center drop-shadow-sm">
            Selamat Datang 🎀
          </h2>
          <p className="text-[#7E5A5A] text-center mt-1 mb-6">
            Masuk untuk menikmati layanan pemesanan kue lezat 🍰
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-[#FFC3D3] focus:ring-2 focus:ring-[#D76A84] outline-none transition bg-white/90 backdrop-blur-xl"
            />

            <input
              type="password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-[#FFC3D3] focus:ring-2 focus:ring-[#D76A84] outline-none transition bg-white/90 backdrop-blur-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D76A84] to-[#E88DA5] text-white font-semibold shadow-xl hover:brightness-105 active:scale-[0.97] transition disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>

            <p className="text-center text-sm text-[#7E5A5A] pt-1">
              Lupa password?{' '}
              <span
                onClick={() => router.push('/forgot-password')}
                className="text-[#D76A84] font-medium hover:underline cursor-pointer"
              >
                Reset di sini
              </span>
            </p>

            <p className="text-center text-sm text-[#7E5A5A]">
              Belum punya akun?{' '}
              <span
                onClick={() => router.push('/register')}
                className="text-[#D76A84] font-medium hover:underline cursor-pointer"
              >
                Daftar di sini
              </span>
            </p>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 text-center rounded-lg text-sm font-medium ${
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

      {/* Footer */}
      <footer className="text-center text-[#C27A8B] py-4 text-sm z-10 font-medium">
        © {new Date().getFullYear()} Pia Popo • Semua hak dilindungi.
      </footer>

      {/* Animations & Effects */}
      <style jsx>{`
        .animate-fade {
          animation: fadein 0.7s ease forwards;
        }
        .animate-slideup {
          animation: slideup 0.9s ease forwards;
        }
        .animate-float1 {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 5s ease-in-out infinite;
        }

        .sweet-card {
          border-radius: 20px;
          border: 2px solid #ffdce8;
        }

        /* Confetti Sprinkles */
        .sprinkle,
        .sprinkle2,
        .sprinkle3 {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #ffbfd1;
          border-radius: 2px;
          opacity: 0.7;
          rotate: 20deg;
        }

        .sprinkle {
          top: 22%;
          left: 14%;
        }
        .sprinkle2 {
          bottom: 30%;
          right: 18%;
          background: #ffd590;
        }
        .sprinkle3 {
          top: 35%;
          right: 30%;
          background: #b7e4ff;
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
            transform: translateY(35px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float2 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(18px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
