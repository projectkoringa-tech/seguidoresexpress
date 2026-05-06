import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';
import { ShoppingCart, Instagram, Music2, Clock, CheckCircle2, History, Search } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

export const Orders: React.FC<{ user: any }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const filteredOrders = orders.filter(o => 
    o.targetAccount.toLowerCase().includes(filter.toLowerCase()) ||
    o.service.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'processing': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Histórico de Pedidos</h1>
          <p className="text-slate-500 font-medium">Acompanhe suas solicitações em tempo real.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar por @user ou serviço..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={order.id}
              className="bento-card group hover:border-brand-primary/30 transition-all flex flex-col p-6 h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                  order.service === 'tiktok' ? "bg-slate-950 border border-slate-800" : "bg-gradient-to-tr from-purple-600 to-pink-600 border border-white/10"
                )}>
                  {order.service === 'tiktok' ? '🎵' : '📸'}
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                  getStatusStyle(order.status)
                )}>
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-100 truncate mb-1">{order.targetAccount}</h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{order.service} followers</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Quantidade</p>
                  <p className="text-xl font-black text-slate-200 font-mono tracking-tight">{order.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Custo Total</p>
                  <p className="text-xl font-black text-emerald-400 font-mono tracking-tight">{formatCurrency(order.cost)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bento-card py-32 flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mb-6 shadow-2xl">
            <ShoppingCart className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-200">Sem atividade recente</h3>
          <p className="text-slate-500 max-w-sm mt-3 font-medium">Você ainda não realizou nenhum pedido em nossa plataforma.</p>
          <Link to="/" className="mt-10 px-8 py-4 bg-brand-primary rounded-2xl font-black text-white shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform">
            Impulsionar Agora
          </Link>
        </div>
      )}
    </div>
  );
};
