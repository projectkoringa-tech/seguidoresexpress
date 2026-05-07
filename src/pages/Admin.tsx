import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, increment } from 'firebase/firestore';
import { Order, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle,
  Search,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to all orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    // Listen to all users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: Record<string, UserProfile> = {};
      snapshot.forEach(doc => {
        usersData[doc.id] = { uid: doc.id, ...doc.data() } as UserProfile;
      });
      setUsers(usersData);
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      if (order.status === 'failed' && newStatus === 'failed') return;

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === 'failed') {
        const userRef = doc(db, 'users', order.userId);
        await updateDoc(userRef, {
          balance: increment(order.cost)
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.targetAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users[order.userId]?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = (Object.values(users) as UserProfile[]).filter((user: UserProfile) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-100 italic tracking-tight">ADMIN DASHBOARD</h1>
          <p className="text-slate-500 font-medium">Painel de gerenciamento exclusivo</p>
        </div>
        
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-black transition-all uppercase tracking-wider",
              activeTab === 'orders' ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-black transition-all uppercase tracking-wider",
              activeTab === 'users' ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Usuários
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pedidos', value: stats.total, icon: Package, color: 'text-slate-100', bg: 'bg-slate-900/50' },
              { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Em Processo', value: stats.processing, icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((stat, i) => (
              <div key={i} className={cn("bento-card p-6 border-transparent", stat.bg)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2 rounded-xl bg-slate-950/50", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-slate-100 tabular-nums">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar por id, conta ou email do usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-4 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-700 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Em Processo</option>
              <option value="completed">Concluídos</option>
              <option value="failed">Falhados</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Conta Alvo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map(order => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id} 
                        className="hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">
                              {users[order.userId]?.name || 'Usuário Desconhecido'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {users[order.userId]?.email || order.userId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-md uppercase",
                            order.service === 'tiktok' ? "bg-slate-950 text-slate-100 border border-slate-800" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          )}>
                            {order.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group">
                            <span className="text-sm font-bold text-slate-300 font-mono">@{order.targetAccount}</span>
                            <button
                              onClick={() => copyToClipboard(order.targetAccount, order.id!)}
                              className={cn(
                                "p-1.5 rounded-md transition-all",
                                copiedId === order.id ? "bg-emerald-500 text-slate-950 scale-110" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300 opacity-0 group-hover:opacity-100"
                              )}
                            >
                              {copiedId === order.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-100">{order.quantity} un</span>
                            <span className="text-[10px] text-slate-500">{formatCurrency(order.cost)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                            order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : 
                            order.status === 'processing' ? "bg-blue-500/10 text-blue-500" :
                            order.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                            "bg-amber-500/10 text-amber-500"
                          )}>
                            {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                            {order.status === 'processing' && <PlayCircle className="w-3 h-3 animate-spin-slow" />}
                            {order.status === 'pending' && <Clock className="w-3 h-3" />}
                            {order.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                            {order.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id!, 'processing')}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                title="Em Processamento"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                onClick={() => updateOrderStatus(order.id!, 'completed')}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                title="Concluir"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {order.status !== 'failed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id!, 'failed')}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                title="Falhar"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <Package className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-slate-500 font-bold italic">Nenhum pedido encontrado com estes filtros.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar usuários por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-4 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Users Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Saldo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">UID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user: UserProfile) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user.uid} 
                        className="hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-100">{user.name}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{user.uid}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs font-medium">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <Smartphone className="w-3 h-3" />
                                <span className="text-xs font-medium">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-100">{formatCurrency(user.balance)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group">
                            <code className="text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-500">
                              {user.uid}
                            </code>
                            <button
                              onClick={() => copyToClipboard(user.uid, user.uid)}
                              className={cn(
                                "p-1 rounded transition-all",
                                copiedId === user.uid ? "text-emerald-500" : "text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100"
                              )}
                            >
                              {copiedId === user.uid ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <Users className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-slate-500 font-bold italic">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
