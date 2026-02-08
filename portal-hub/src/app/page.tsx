"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalHub() {
  const [adisyonlar, setAdisyonlar] = useState<any[]>([]);

  useEffect(() => {
    // Verileri ilk kez çek
    const fetchAdisyonlar = async () => {
      const { data } = await supabase.from('adisyonlar').select('*');
      if (data) setAdisyonlar(data);
    };
    fetchAdisyonlar();

    // CANLI GÜNCELLEME: Bir sipariş gelince sayfayı yenilemeden gör
    const subscription = supabase.channel('adisyon-takip')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'adisyonlar' }, (payload) => {
        fetchAdisyonlar();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black tracking-tighter text-orange-500">PORTAL HUB <span className="text-white font-light text-sm">v1.0</span></h1>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Şube Durumu</p>
          <p className="text-green-400 font-bold">● CANLI</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {adisyonlar.map((adisyon) => (
          <div key={adisyon.id} className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center
            ${adisyon.durum === 'beklemede' ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-5xl font-black mb-2">{adisyon.masa_no}</span>
            <p className="text-xs font-bold opacity-60 uppercase">{adisyon.durum === 'beklemede' ? 'SİPARİŞ VAR' : 'BOŞ'}</p>
            {adisyon.durum === 'beklemede' && (
              <p className="mt-4 text-xl font-mono text-red-400">{adisyon.toplam_tutar} ₺</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}