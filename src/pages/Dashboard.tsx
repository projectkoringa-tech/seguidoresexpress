import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { UserProfile, TIKTOK_RATE, INSTAGRAM_RATE, MIN_ORDER } from '../types';
import { Instagram, Music2, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency, validateAccount } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  user: any;
  profile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, profile }) => {
  const [service, setService] = useState<'tiktok' | 'instagram'>('tiktok');
  const [account, setAccount] = useState('');
  const [quantity, setQuantity] = useState(MIN_ORDER);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = service === 'tiktok' ? TIKTOK_RATE : INSTAGRAM_RATE;
  const totalCost = (quantity / 100) * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!profile) return;
    if (quantity < MIN_ORDER) {
      setError(`Quantidade mínima é de ${MIN_ORDER} seguidores.`);
      return;
    }
    if (!validateAccount(service, account)) {
      setError("Por favor, insira um link ou @user válido.");
      return;
    }
    if (profile.balance < totalCost) {
      setError("Saldo insuficiente. Por favor, carregue sua conta.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        service,
        targetAccount: account,
        quantity,
        cost: totalCost,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-totalCost)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: totalCost,
        type: 'order_payment',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setAccount('');
      setQuantity(MIN_ORDER);
    } catch (err) {
      setError("Ocorreu um erro ao processar seu pedido. Tente novamente.");
      handleFirestoreError(err, OperationType.WRITE, 'orders/users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 font-medium mt-1">Bem-vindo de volta ao SeguidoresExpress</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Saldo</span>
            <span className="text-emerald-400 font-mono font-bold text-lg">{formatCurrency(profile?.balance || 0)}</span>
          </div>
          <Link to="/add-funds" className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl transition-all shadow-lg shadow-brand-primary/20 font-bold">
            Recarregar
          </Link>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 auto-rows-[120px] gap-6">
        
        {/* Main Order Card */}
        <div className="col-span-12 lg:col-span-8 row-span-4 bento-card p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-3 h-3 bg-brand-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
              Configurar Pedido
            </h3>
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setService('tiktok')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                  service === 'tiktok' ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                TikTok
              </button>
              <button 
                onClick={() => setService('instagram')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                  service === 'instagram' ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Instagram
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Link do Perfil ou @usuário</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={service === 'tiktok' ? "ex: @meu_tiktok" : "ex: @meu_insta"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors text-sm font-medium placeholder:text-slate-700"
                  required
                />
                {validateAccount(service, account) && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Válido
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quantidade (Min. 100)</label>
                <input 
                  type="number" 
                  value={quantity}
                  step={100}
                  min={100}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors font-mono font-bold text-lg"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total a Pagar</label>
                <div className={cn(
                  "w-full bg-slate-950 border border-brand-primary/20 rounded-2xl px-6 py-4 text-brand-primary font-black font-mono text-xl flex items-center",
                  profile && profile.balance < totalCost ? "text-red-400 border-red-400/20" : ""
                )}>
                  {formatCurrency(totalCost)}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4" />
                Pedido realizado com sucesso! Em breve começará a cair.
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-auto py-5 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Confirmar Pedido Agora'}
              {!loading && <ArrowRight className="w-6 h-6" />}
            </button>
          </form>
        </div>

        {/* Stats Card */}
        <div className="col-span-12 lg:col-span-4 row-span-2 bg-brand-primary rounded-[32px] p-8 relative overflow-hidden group shadow-2xl shadow-brand-primary/20">
          <div className="relative z-10 flex flex-col h-full">
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Total de Seguidores</p>
            <h4 className="text-5xl font-black mt-2 text-white tabular-nums">1.2M+</h4>
            <div className="mt-auto inline-flex items-center px-3 py-1 bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-sm self-start">
              +15% cresc. global
            </div>
          </div>
          {/* Abstract background SVG */}
          <svg className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
        </div>

        {/* Pricing Card */}
        <div className="col-span-12 lg:col-span-4 row-span-2 bento-card p-6 grid grid-rows-2 gap-4">
          <div className="flex items-center gap-5 bento-inner">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl shadow-inner shadow-white/5">🎵</div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">TikTok SMM</p>
              <p className="text-lg font-black text-slate-100">{formatCurrency(TIKTOK_RATE)} <span className="text-xs text-slate-600 font-bold">/ 100 seg.</span></p>
            </div>
          </div>
          <div className="flex items-center gap-5 bento-inner">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl shadow-inner shadow-white/5">📸</div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Instagram SMM</p>
              <p className="text-lg font-black text-slate-100">{formatCurrency(INSTAGRAM_RATE)} <span className="text-xs text-slate-600 font-bold">/ 100 seg.</span></p>
            </div>
          </div>
        </div>

        {/* Decorative / Info Card */}
        <div className="col-span-12 lg:col-span-12 row-span-1 bento-card px-8 flex items-center justify-between border-brand-primary/20 bg-brand-primary/5">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-slate-300">Sistemas Online</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <p className="text-xs text-slate-500 font-medium italic">Suporte WhatsApp 24/7 disponível no perfil</p>
           </div>
           <div className="hidden md:flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-800" />
              <div className="w-6 h-6 rounded-full bg-slate-800" />
              <div className="w-6 h-6 rounded-full bg-slate-800" />
           </div>
        </div>
      </div>
    </div>
  );
};
