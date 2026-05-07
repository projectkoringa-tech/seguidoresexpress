import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Wallet, CreditCard, Smartphone, CheckCircle2, QrCode, AlertCircle, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AddFunds: React.FC<{ user: any, profile: UserProfile | null }> = ({ user, profile }) => {
  const [amount, setAmount] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const presets = [1, 100, 300, 500, 1000];

  const handleDeposit = async () => {
    if (!showWarning) {
      setShowWarning(true);
      return;
    }

    setLoading(true);
    setShowWarning(false);
    setError(null);
    
    // Store for secret success page retrieval
    localStorage.setItem('val_carregamento', amount.toString());
    
    // Payment link mapping
    const links: Record<number, string> = {
      1: 'https://kiki.oluali.com/y9eya64e',
      100: 'https://pay.kumbipay.com/aca90fe1-2e66-4ab0-8b8b-ff35130c9509',
      300: 'https://pay.kumbipay.com/57780fcd-9ce0-4235-beb5-1e9ee1c02595',
      500: 'https://pay.kumbipay.com/e771b0db-f4c7-4560-a7d7-87a955a12d1e',
      1000: 'https://kiki.oluali.com/9c70g56n'
    };

    const targetLink = links[amount];

    if (!targetLink) {
      setError(`Selecione um valor válido (1, 100, 300, 500 ou 1000 Kz)`);
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bento-card p-8 relative space-y-6"
          >
            <button 
              onClick={() => setShowWarning(false)}
              className="absolute right-6 top-6 text-slate-500 hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-black text-slate-100 italic">Aviso Importante</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                <span className="text-amber-500 font-bold block mb-2">Nota:</span>
                Quando realizar o pagamento, se receber uma notificação para sair, clica em <span className="text-slate-100 font-bold">"Sair"</span> para que o pagamento seja concluído com sucesso.
              </p>
            </div>

            <div className="grid gap-3 pt-4">
              <button
                onClick={handleDeposit}
                className="w-full bg-slate-100 text-slate-950 font-black py-4 rounded-2xl hover:bg-white transition-all active:scale-95"
              >
                Entendi e Avançar
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="w-full bg-slate-900 text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
