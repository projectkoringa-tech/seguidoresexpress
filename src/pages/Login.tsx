import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Chrome, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          name: result.user.displayName || 'Usuário',
          email: result.user.email,
          phone: '',
          balance: 0,
          createdAt: serverTimestamp(),
        });
      }
      
      navigate('/');
    } catch (err: any) {
      setError("Erro ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(79,70,229,0.3)] rotate-3">
            <span className="text-white text-4xl font-black italic">S</span>
          </div>
          <h1 className="text-4xl font-black text-slate-100 italic tracking-tight">SeguidoresExpress</h1>
          <p className="text-slate-500 font-medium mt-2">O seu sucesso social começa aqui.</p>
        </div>

        <div className="bento-card p-10">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 italic">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar na Plataforma'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-slate-900 px-4 text-slate-600 tracking-widest">Ou continue com</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 hover:bg-slate-100"
          >
            <Chrome className="w-5 h-5" />
            Google
          </button>
        </div>

        <p className="text-center mt-10 text-slate-500 font-bold">
          Novo por aqui?{' '}
          <Link to="/signup" className="text-brand-primary hover:underline italic">Criar uma conta</Link>
        </p>
      </motion.div>
    </div>
  );
};
