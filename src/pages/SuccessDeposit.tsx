import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export const SuccessDeposit: React.FC<{ user: any }> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [amount, setAmount] = useState<number>(0);
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (!user || processedRef.current) return;

    const storedAmount = localStorage.getItem('val_carregamento');
    const queryAmount = Number(searchParams.get('v'));
    
    const finalAmount = queryAmount || (storedAmount ? Number(storedAmount) : 0);
    
    if (finalAmount <= 0) {
      setError('Valor inválido para carregamento.');
      setProcessing(false);
      return;
    }

    setAmount(finalAmount);
    processedRef.current = true;

    const processDirectDeposit = async () => {
      try {
        // Update user balance
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          balance: increment(finalAmount)
        });

        // Log transaction
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          amount: finalAmount,
          type: 'deposit_direct',
          description: 'Recarga Instantânea Secreta',
          createdAt: serverTimestamp(),
        });

        // Clear secret storage
        localStorage.removeItem('val_carregamento');

        setProcessing(false);
        // Redirect after 3 seconds
        setTimeout(() => navigate('/'), 3000);
      } catch (err: any) {
        console.error(err);
        setError('Ocorreu um erro ao processar a recarga.');
        setProcessing(false);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/deposit`);
      }
    };

    processDirectDeposit();
  }, [user, navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bento-card p-10 relative overflow-hidden"
      >
        {processing ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">Sincronizando...</h2>
              <p className="text-slate-500 font-medium mt-2">Estamos processando seu carregamento VIP.</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-red-400 italic tracking-tight">Falha no Sistema</h2>
              <p className="text-slate-500 font-medium mt-2">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-slate-400"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="space-y-6">
             <motion.div 
               animate={{ rotate: [0, 10, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]"
             >
               <Sparkles className="w-12 h-12 text-white" />
             </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white italic tracking-tight underline decoration-emerald-500 underline-offset-8">Sucesso Absoluto!</h2>
              <p className="text-emerald-400 font-black text-xl font-mono mt-4">
                +{formatCurrency(amount)}
              </p>
              <p className="text-slate-500 font-medium pt-2">
                Seu saldo foi atualizado instantaneamente.
              </p>
            </div>

            <div className="pt-6">
              <div className="w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Redirecionando em instantes...
              </div>
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
};
