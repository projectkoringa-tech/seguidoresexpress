import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Wallet, CreditCard, Smartphone, CheckCircle2, QrCode } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AddFunds: React.FC<{ user: any, profile: UserProfile | null }> = ({ user, profile }) => {
  const [amount, setAmount] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [1, 300, 500, 1000];

  const handleDeposit = async () => {
    setLoading(true);
    setError(null);
    
    // Store for secret success page retrieval
    localStorage.setItem('val_carregamento', amount.toString());
    
    // Payment link mapping
    const links: Record<number, string> = {
      1: 'https://kiki.oluali.com/y9eya64e',
      300: 'https://kiki.oluali.com/gf59gvd0',
      500: 'https://kiki.oluali.com/vzdtuc6w',
      1000: 'https://kiki.oluali.com/9c70g56n'
    };

    const targetLink = links[amount];

    if (!targetLink) {
      setError(`Selecione um valor válido (1, 300, 500 ou 1000 Kz)`);
      setLoading(false);
      return;
    }

    try {
      // Small delay for UI feedback
      await new Promise(r => setTimeout(r, 800));
      window.open(targetLink, '_blank');
    } catch (err) {
      console.error(err);
      setError('Erro ao redirecionar para o pagamento.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl border border-brand-primary/20 flex items-center justify-center mx-auto shadow-2xl">
          <Wallet className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-100 tracking-tight">Carregar Conta</h1>
        <p className="text-slate-500 font-medium">Escolha o valor que deseja adicionar agora.</p>
      </header>

      <div className="bento-card p-10 space-y-10">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Selecione o valor desejado</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={cn(
                  "py-4 rounded-2xl border-2 font-black transition-all text-sm",
                  amount === v 
                    ? "border-brand-primary bg-brand-primary text-white shadow-xl shadow-brand-primary/30" 
                    : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                )}
              >
                {v} Kz
              </button>
            ))}
          </div>
        </div>

        <div className="bento-inner !p-6 space-y-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Instruções de Pagamento</p>
          <div className="flex items-center gap-5 bg-slate-900/50 p-5 rounded-2xl border border-brand-primary/20">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-100 italic">Vvia Pagamento Seguro</h4>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Após o pagamento, seu saldo será atualizado.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-black italic border border-red-500/20">
            {error}
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={loading}
          className="w-full bg-slate-100 text-slate-950 font-black py-6 rounded-[2rem] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Redirecionando...' : `Confirmar Pagamento de ${formatCurrency(amount)}`}
        </button>
      </div>
    </div>
  );
};
