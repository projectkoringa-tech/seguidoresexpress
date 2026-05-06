import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, Phone, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        balance: 0,
        createdAt: serverTimestamp(),
      });

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso.");
      } else {
        setError("Ocorreu um erro ao criar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mb-32" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10">
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 hover:text-slate-300 transition-colors">
            <ArrowRight className="w-3 h-3 rotate-180" />
            Voltar ao Início
          </Link>
          <h1 className="text-4xl font-black text-slate-100 italic tracking-tight">Criar Identidade Social</h1>
          <p className="text-slate-500 font-medium mt-2">Junte-se à maior plataforma de SMM de Angola.</p>
        </div>

        <div className="bento-card p-10">
          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <UserPlus className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="Seu Nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp (+244)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="9xx xxx xxx"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço de E-mail</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="email@provedor.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-bold text-slate-100 placeholder:text-slate-700"
                  placeholder="Sua senha secreta"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="md:col-span-2 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 italic">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Criando Conta...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-500 font-bold">
          Já faz parte da elite?{' '}
          <Link to="/login" className="text-brand-primary hover:underline italic">Entrar agora</Link>
        </p>
      </motion.div>
    </div>
  );
};
