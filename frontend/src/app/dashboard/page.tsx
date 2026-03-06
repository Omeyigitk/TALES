'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Campaign {
    _id: string;
    name: string;
    dmId: string;
}

export default function Dashboard() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [campaignName, setCampaignName] = useState("");
    const [error, setError] = useState("");

    // User Management States
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (!authLoading && !user) router.push('/');
        if (user && token) fetchCampaigns();
    }, [user, authLoading]);

    const fetchCampaigns = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setCampaigns(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignName) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: campaignName })
            });
            if (res.ok) {
                setCampaignName("");
                fetchCampaigns();
            } else {
                const data = await res.json();
                setError(data.error);
            }
        } catch (err) {
            setError("Bağlantı hatası");
        }
    };

    const handleJoinCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignName) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/campaigns/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ campaignName })
            });
            if (res.ok) {
                setCampaignName("");
                fetchCampaigns();
            } else {
                const data = await res.json();
                setError(data.error);
            }
        } catch (err) {
            setError("Bağlantı hatası");
        }
    };

    const fetchAllUsers = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAllUsers(data);
                setIsUserManagementOpen(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleResetPassword = async (targetUserId: string, username: string) => {
        const newPass = prompt(`${username} için yeni şifreyi girin:`, "123456");
        if (!newPass) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/admin/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId, newPassword: newPass })
            });
            if (res.ok) {
                alert("Şifre başarıyla güncellendi!");
            }
        } catch (err) {
            alert("Hata oluştu");
        }
    };

    if (authLoading || !user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <main className="min-h-screen bg-gray-950 p-8 text-white bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-center border-b border-gray-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
                            Maceracı Paneli
                        </h1>
                        <p className="text-gray-400">Hoş geldin, <span className="text-yellow-500 font-bold">{user.username}</span> ({user.role})</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user.role === 'DM' && (
                            <button
                                onClick={fetchAllUsers}
                                className="px-4 py-2 bg-blue-900/30 border border-blue-500/50 text-blue-100 rounded-lg hover:bg-blue-800 transition-all text-sm font-bold"
                            >
                                👥 KULLANICILAR
                            </button>
                        )}
                        <button onClick={logout} className="px-6 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all text-sm font-bold">
                            ÇIKIŞ YAP
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sol Kolon: Yeni Kampanya / Katılma */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-4 uppercase tracking-tighter">
                            {user.role === 'DM' ? 'Yeni Kampanya Oluştur' : 'Kampanyaya Katıl'}
                        </h2>
                        <form onSubmit={user.role === 'DM' ? handleCreateCampaign : handleJoinCampaign} className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <div>
                                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Kampanya Adı</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-950 border border-gray-700 p-3 rounded-lg text-white"
                                    placeholder="Ejderha'nın İni..."
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full py-3 font-bold rounded-lg transition-all ${user.role === 'DM' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                            >
                                {user.role === 'DM' ? 'OLUŞTUR' : 'KATIL'}
                            </button>
                        </form>
                    </section>

                    {/* Sağ Kolon: Mevcut Kampanyalar */}
                    <section className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold border-l-4 border-yellow-500 pl-4 uppercase tracking-tighter">Mevcut Maceraların</h2>
                        {loading ? (
                            <p>Yükleniyor...</p>
                        ) : campaigns.length === 0 ? (
                            <div className="bg-gray-900 border border-dashed border-gray-800 p-12 rounded-xl text-center">
                                <p className="text-gray-500 italic">Henüz bir maceraya dahil değilsin.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campaigns.map(c => (
                                    <button
                                        key={c._id}
                                        onClick={() => router.push(user.role === 'DM' ? `/dm/${c._id}/dashboard` : `/player/${c._id}/character-creator`)}
                                        className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-red-500 transition-all text-left flex flex-col justify-between group"
                                    >
                                        <div>
                                            <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors uppercase tracking-tight">{c.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1 opacity-50">{c._id}</p>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                                            MACERAYA DEVAM ET <span className="ml-2">&rarr;</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            {/* User Management Modal */}
            {isUserManagementOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
                    <div className="bg-gray-900 border-4 border-blue-900 rounded-lg p-6 w-full max-w-2xl h-[70vh] flex flex-col relative shadow-[10px_10px_0px_#1e3a8a]">
                        <button onClick={() => setIsUserManagementOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl">✕</button>
                        <h2 className="text-3xl font-black text-blue-500 mb-6 border-b-2 border-blue-900 pb-2 uppercase tracking-tighter">👥 Kullanıcı Yönetimi</h2>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {allUsers.map(u => (
                                <div key={u._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-blue-500 transition-colors">
                                    <div>
                                        <div className="text-white font-bold text-lg">{u.username}</div>
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-500">{u.role}</div>
                                    </div>
                                    <button
                                        onClick={() => handleResetPassword(u._id, u.username)}
                                        className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                                    >
                                        Şifreyi Sıfırla
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
