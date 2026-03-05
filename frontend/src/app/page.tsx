"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Player" as "Player" | "DM"
  });

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        setError("Kayıt başarılı! Şimdi giriş yapabilirsin.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-2 drop-shadow-lg">
            Tales & Taverns
          </h1>
          <p className="text-gray-400 font-medium">Maceraya giriş yapın</p>
        </div>

        {error && (
          <div className={`p-4 rounded-lg text-sm ${error.includes('başarılı') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Kullanıcı Adı</label>
            <input
              type="text"
              required
              className="w-full bg-gray-950 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Şifre</label>
            <input
              type="password"
              required
              className="w-full bg-gray-950 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Rol Seçimi</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Player' })}
                  className={`p-3 rounded-lg border transition-all ${formData.role === 'Player' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-gray-950 border-gray-700 text-gray-400'}`}
                >
                  Oyuncu
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'DM' })}
                  className={`p-3 rounded-lg border transition-all ${formData.role === 'DM' ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-950 border-gray-700 text-gray-400'}`}
                >
                  Dungeon Master
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Bekleyin..." : (isLogin ? "GİRİŞ YAP" : "KAYIT OL")}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            {isLogin ? "Hesabınız yok mu? Hemen kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </div>
      </div>
    </main>
  );
}
