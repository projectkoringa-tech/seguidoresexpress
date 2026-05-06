import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { UserProfile } from '../types';
import { User, Phone, Mail, Save, CheckCircle2, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile: React.FC<{ user: any, profile: UserProfile | null }> = ({ user, profile }) => {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name, phone });
      await updateProfile(user, { displayName: name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Meus Dados</h1>
        <p className="text-slate-500 font-medium">Gerencie suas informações de conta.</p>
      </header>

      <div className="bento-card p-10">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail (Inalterável)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={profile?.email}
                disabled
                className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none opacity-50 cursor-not-allowed font-bold text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                <UserCircle className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp (+244)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 flex items-center justify-center gap-3 p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 font-black italic text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                Perfil atualizado com sucesso!
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-100 text-slate-950 font-black py-4 rounded-2xl hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
              <Save className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="bento-inner !p-8">
        <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight mb-4 italic">Zona de Segurança</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">O ID único da sua conta é restrito para processos de faturamento. Mantenha-o em sigilo para evitar fraudes.</p>
        <div className="mt-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">UID Identifier</p>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl font-mono text-xs text-brand-primary/80 overflow-x-auto whitespace-nowrap">
              {user.uid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
