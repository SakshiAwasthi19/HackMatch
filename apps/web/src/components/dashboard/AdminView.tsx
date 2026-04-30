'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, MapPin, Globe, Loader2, CheckCircle2, AlertCircle,
  LayoutGrid, Users, ShieldAlert, BarChart3, Search, Filter, 
  Edit2, Trash2, MoreVertical, ExternalLink, Shield, ArrowUpRight,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/auth-client';
import { Hackathon, User, HostRequest } from '@/lib/types';
import { useMemo, useCallback } from 'react';

export type AdminTab = 'dashboard' | 'hackathons' | 'users' | 'moderation' | 'analytics' | 'create';

interface AdminViewProps {
  initialTab?: AdminTab;
}

const SidebarItem = ({ id, label, icon: Icon, activeTab, setActiveTab }: { id: AdminTab, label: string, icon: React.ComponentType<{ className?: string }>, activeTab: AdminTab, setActiveTab: (id: AdminTab) => void }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
      ${activeTab === id 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
  >
    <Icon className={`h-4 w-4 ${activeTab === id ? 'text-indigo-400' : ''}`} />
    {label}
  </button>
);

export default function AdminView({ initialTab = 'dashboard' }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [hostRequests, setHostRequests] = useState<HostRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Creation State
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    city: '',
    mode: 'ONLINE',
    eligibilityType: 'OPEN',
    eligibleCollegesList: '',
    websiteUrl: '',
    imageUrl: '',
    tags: 'AI',
  });
  const [customTag, setCustomTag] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const domains = ["AI", "Open Source", "Finance", "Web3", "Development", "Cyber Security", "Others"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, uRes, hrRes] = await Promise.all([
        apiFetch('/api/hackathons'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/host-requests')
      ]);
      
      if (hRes.ok) setHackathons(await hRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (hrRes.ok) setHostRequests(await hrRes.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'eligibleCollegesList') {
          const list = (value as string).split(',').map(c => c.trim()).filter(Boolean);
          formDataToSend.append(key, JSON.stringify(list));
        } else if (key === 'tags') {
          const tagValue = value === 'Others' ? (customTag || 'Others') : value;
          formDataToSend.append(key, JSON.stringify([tagValue]));
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      if (posterFile) formDataToSend.append('poster', posterFile);

      const res = await apiFetch('/api/admin/hackathons', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create hackathon');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('hackathons');
        fetchData();
      }, 2000);

      setFormData({
        name: '', description: '', startDate: '', endDate: '',
        location: '', city: '', mode: 'ONLINE', eligibilityType: 'OPEN',
        eligibleCollegesList: '', websiteUrl: '', imageUrl: '', tags: 'AI'
      });
      setCustomTag('');
      setPosterFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHackathon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      const res = await apiFetch(`/api/admin/hackathons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user profile? This action cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const now = useMemo(() => Date.now(), []);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#050507] rounded-[2.5rem] overflow-hidden border border-zinc-800/50 shadow-2xl">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800/50 flex flex-col p-6 space-y-8 bg-[#0a0a0c]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Admin Console</h2>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">Precision Control</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <SidebarItem id="dashboard" label="Dashboard" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="hackathons" label="Hackathons" icon={LayoutGrid} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="users" label="Users" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="moderation" label="Moderation" icon={ShieldAlert} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="analytics" label="Analytics" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="space-y-4 pt-6 border-t border-zinc-800/50">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Create Hackathon
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#0a0a0c] to-black">
        {activeTab === 'hackathons' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Hackathons</h1>
                <p className="text-zinc-500 mt-2">Manage and monitor current and upcoming events.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all w-64"
                  />
                </div>
                <button className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Hackathons', value: hackathons.length, change: '+12% vs last month', icon: LayoutGrid },
                { label: 'Active Users', value: users.length, change: 'Live Now', icon: Users, isLive: true },
                { label: 'Pending Approvals', value: '18', change: 'Action Required', icon: ShieldAlert, isWarning: true },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-[#0a0a0c] border border-zinc-800/50 rounded-[2rem] space-y-4 group hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-zinc-900 rounded-xl text-zinc-400 group-hover:text-indigo-400 transition-colors">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="h-8 w-12 bg-gradient-to-br from-zinc-800 to-transparent rounded-full opacity-50"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-4xl font-black text-white">{stat.value}</span>
                      <span className={`text-[10px] font-bold pb-1 ${stat.isWarning ? 'text-orange-400' : 'text-indigo-400'}`}>
                        {stat.isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hackathon Management Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((h) => {
                const isExpired = new Date(h.endDate) < new Date();
                const isUpcoming = new Date(h.startDate) > new Date();
                const isActive = !isExpired && !isUpcoming;

                return (
                  <div key={h.id} className="group bg-[#0a0a0c] border border-zinc-800/50 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col shadow-2xl">
                    <div className="relative h-40 bg-zinc-900 overflow-hidden">
                      <Image 
                        src={h.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80'} 
                        alt={h.name}
                        fill
                        className="object-cover opacity-60 group-hover:scale-105 transition-all duration-700" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border backdrop-blur-md
                          ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            isUpcoming ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                          {isActive ? '• Active' : isUpcoming ? 'Upcoming' : 'Expired'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{h.name}</h3>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {h.tags?.[0] || 'Development'} • ${h.mode === 'ONLINE' ? 'Global' : h.city}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {h.description}
                      </p>
                      
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-2/3 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-zinc-800/50 mt-auto">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">
                          {isExpired ? 'Ended Oct 12' : isUpcoming ? `Starts in ${Math.ceil((new Date(h.startDate).getTime() - now) / (1000*60*60*24))} days` : '3 Days Left'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteHackathon(h.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create Placeholder Card */}
              <button 
                onClick={() => setActiveTab('create')}
                className="group border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-900/10 transition-all hover:bg-indigo-500/5"
              >
                <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xl">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Create New Hackathon</h4>
                  <p className="text-zinc-600 text-xs mt-2 max-w-[180px]">Draft a new competition and invite sponsors.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">User Management</h1>
                <p className="text-zinc-500 mt-2">Oversee platform access, monitor user activity, and manage member credentials.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Students:</span>
                  <span className="text-sm font-bold text-white">{users.length}</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Active Now:</span>
                  <span className="text-sm font-bold text-white">
                    {users.filter(u => {
                      const lastActive = new Date(u.lastActiveAt || u.updatedAt || now);
                      const diffInMinutes = (now - lastActive.getTime()) / (1000 * 60);
                      return diffInMinutes < 15; // Active if active in last 15 mins
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Registered Students</h3>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <Filter className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-zinc-800/50">
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Skills</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Active</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-zinc-800/10 transition-all">
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full border border-zinc-800 p-0.5 group-hover:border-indigo-500/50 transition-all">
                                <Image 
                                  src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                                  alt={user.name}
                                  fill
                                  className="object-cover rounded-full" 
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name}</p>
                                <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold tracking-tight border border-indigo-500/20">
                              {user.title || 'Developer'}
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-1.5">
                              {user.skills?.slice(0, 2).map((s) => (
                                <span key={s.skill.id} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 rounded uppercase">
                                  {s.skill.name}
                                </span>
                              ))}
                              {user.skills?.length > 2 && (
                                <span className="text-[9px] font-bold text-zinc-600">+{user.skills.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            {(() => {
                              const lastActive = new Date(user.lastActiveAt || user.updatedAt || now);
                              const diffInMinutes = (now - lastActive.getTime()) / (1000 * 60);
                              const isActive = diffInMinutes < 15;
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                                  <span className="text-xs text-zinc-400">{isActive ? 'Active' : 'Offline'}</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-5 px-4 text-right space-x-2">
                            <button className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 transition-all">
                              View Details
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-500">Showing 1-{users.length} of {users.length} users</p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><ChevronLeft className="h-4 w-4" /></button>
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">1</button>
                    <button className="px-3 py-1 bg-zinc-900 text-zinc-500 rounded-lg text-xs font-bold">2</button>
                    <button className="px-3 py-1 bg-zinc-900 text-zinc-500 rounded-lg text-xs font-bold">3</button>
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Analytics & Requests</h1>
                <p className="text-zinc-500 mt-2">Monitor platform growth and manage incoming host applications.</p>
              </div>
              <div className="flex items-center gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setRequestFilter(f)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      requestFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Requests', value: hostRequests.length, color: 'text-white' },
                { label: 'Pending', value: hostRequests.filter(r => r.status === 'PENDING').length, color: 'text-indigo-400' },
                { label: 'Accepted', value: hostRequests.filter(r => r.status === 'APPROVED').length, color: 'text-emerald-400' },
                { label: 'Rejected', value: hostRequests.filter(r => r.status === 'REJECTED').length, color: 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="p-6 bg-[#0a0a0c] border border-zinc-800/50 rounded-3xl space-y-2 group hover:border-zinc-700 transition-all">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {requestFilter === 'ALL' ? 'All' : requestFilter.charAt(0) + requestFilter.slice(1).toLowerCase()} Host Requests
                  </h3>
                </div>

                <div className="space-y-4">
                  {hostRequests.filter(r => requestFilter === 'ALL' || r.status === requestFilter).length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-zinc-500 text-sm italic">No requests found matching your filter.</p>
                    </div>
                  )}
                  {hostRequests
                    .filter(r => requestFilter === 'ALL' || r.status === requestFilter)
                    .map((req) => (
                    <div key={req.id} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-zinc-800">
                          <Users className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-white">{req.user?.name || 'Anonymous User'}</p>
                            {req.status !== 'PENDING' && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {req.status === 'APPROVED' ? 'Accepted' : 'Rejected'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500">{req.user?.email} • {new Date(req.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-zinc-400 mt-2 italic">&quot;{req.reason}&quot;</p>
                        </div>
                      </div>
                      
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={async () => {
                              try {
                                const res = await apiFetch(`/api/admin/host-requests/${req.id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ status: 'APPROVED' })
                                });
                                if (res.ok) {
                                  alert('Request Approved! User promoted to Admin.');
                                  fetchData(); // Refresh list
                                }
                              } catch (e) { console.error(e); }
                            }}
                            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-400 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await apiFetch(`/api/admin/host-requests/${req.id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ status: 'REJECTED' })
                                });
                                if (res.ok) {
                                  alert('Request Rejected.');
                                  fetchData(); // Refresh list
                                }
                              } catch (e) { console.error(e); }
                            }}
                            className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Launch Event</h1>
                <p className="text-zinc-500 mt-2">Draft and publish a new hackathon competition.</p>
              </div>
              <button 
                onClick={() => setActiveTab('hackathons')}
                className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all border border-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <form onSubmit={handleCreateHackathon} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Hackathon Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Global AI Summit 2024"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the mission, prize pool, and tracks..."
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Start Date</label>
                      <input
                        required
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">End Date</label>
                      <input
                        required
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Mode</label>
                      <select
                        value={formData.mode}
                        onChange={e => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white appearance-none cursor-pointer"
                      >
                        <option value="ONLINE">Online (Remote)</option>
                        <option value="IN_PERSON">In-Person</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Target Domain / Tag</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          value={formData.tags}
                          onChange={e => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white appearance-none cursor-pointer"
                        >
                          {domains.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {formData.tags === 'Others' && (
                          <input
                            required
                            type="text"
                            value={customTag}
                            onChange={e => setCustomTag(e.target.value)}
                            placeholder="Specify domain..."
                            className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Application URL</label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://hackathon.com/apply"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">City (If In-Person)</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Event Poster</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="Or paste direct image URL..."
                          className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => setPosterFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl text-zinc-500 flex items-center gap-3 font-medium">
                            <Globe className="h-5 w-5 text-indigo-500" />
                            <span>{posterFile ? posterFile.name : 'Upload file from local...'}</span>
                          </div>
                        </div>
                      </div>
                      {(formData.imageUrl || posterFile) && (
                        <div className="mt-4 relative w-full h-56 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                          <Image
                            src={posterFile ? URL.createObjectURL(posterFile) : formData.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <button 
                            onClick={() => { setPosterFile(null); setFormData({ ...formData, imageUrl: '' }); }}
                            className="absolute top-4 right-4 p-2 bg-black/80 rounded-full text-white hover:bg-red-500 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {success && (
                    <div className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold">Hackathon published successfully! Redirecting...</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">{error}</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> PUBLISHING...</>
                      ) : (
                        <><Plus className="h-6 w-6" /> PUBLISH HACKATHON</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">User Management</h1>
                <p className="text-zinc-500 mt-2">Oversee platform access, monitor user activity, and manage member credentials.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Students:</span>
                  <span className="text-sm font-bold text-white">{users.length}</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Active Now:</span>
                  <span className="text-sm font-bold text-white">
                    {users.filter(u => {
                      const lastActive = new Date(u.lastActiveAt || u.updatedAt || now);
                      const diffInMinutes = (now - lastActive.getTime()) / (1000 * 60);
                      return diffInMinutes < 15; // Active if active in last 15 mins
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Registered Students</h3>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <Filter className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-zinc-800/50">
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Skills</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Active</th>
                        <th className="pb-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-zinc-800/10 transition-all">
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full border border-zinc-800 p-0.5 group-hover:border-indigo-500/50 transition-all">
                                <Image 
                                  src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                                  alt={user.name}
                                  fill
                                  className="object-cover rounded-full" 
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name}</p>
                                <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold tracking-tight border border-indigo-500/20">
                              {user.title || 'Developer'}
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-1.5">
                              {user.skills?.slice(0, 2).map((s) => (
                                <span key={s.skill.id} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 rounded uppercase">
                                  {s.skill.name}
                                </span>
                              ))}
                              {user.skills?.length > 2 && (
                                <span className="text-[9px] font-bold text-zinc-600">+{user.skills.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            {(() => {
                              const lastActive = new Date(user.lastActiveAt || user.updatedAt || now);
                              const diffInMinutes = (now - lastActive.getTime()) / (1000 * 60);
                              const isActive = diffInMinutes < 15;
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                                  <span className="text-xs text-zinc-400">{isActive ? 'Active' : 'Offline'}</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-5 px-4 text-right space-x-2">
                            <button className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 transition-all">
                              View Details
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-500">Showing 1-{users.length} of {users.length} users</p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><ChevronLeft className="h-4 w-4" /></button>
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">1</button>
                    <button className="px-3 py-1 bg-zinc-900 text-zinc-500 rounded-lg text-xs font-bold">2</button>
                    <button className="px-3 py-1 bg-zinc-900 text-zinc-500 rounded-lg text-xs font-bold">3</button>
                    <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Analytics & Requests</h1>
                <p className="text-zinc-500 mt-2">Monitor platform growth and manage incoming host applications.</p>
              </div>
              <div className="flex items-center gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setRequestFilter(f)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      requestFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Requests', value: hostRequests.length, color: 'text-white' },
                { label: 'Pending', value: hostRequests.filter(r => r.status === 'PENDING').length, color: 'text-indigo-400' },
                { label: 'Accepted', value: hostRequests.filter(r => r.status === 'APPROVED').length, color: 'text-emerald-400' },
                { label: 'Rejected', value: hostRequests.filter(r => r.status === 'REJECTED').length, color: 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="p-6 bg-[#0a0a0c] border border-zinc-800/50 rounded-3xl space-y-2 group hover:border-zinc-700 transition-all">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {requestFilter === 'ALL' ? 'All' : requestFilter.charAt(0) + requestFilter.slice(1).toLowerCase()} Host Requests
                  </h3>
                </div>

                <div className="space-y-4">
                  {hostRequests.filter(r => requestFilter === 'ALL' || r.status === requestFilter).length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-zinc-500 text-sm italic">No requests found matching your filter.</p>
                    </div>
                  )}
                  {hostRequests
                    .filter(r => requestFilter === 'ALL' || r.status === requestFilter)
                    .map((req) => (
                    <div key={req.id} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-zinc-800">
                          <Users className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-white">{req.user?.name || 'Anonymous User'}</p>
                            {req.status !== 'PENDING' && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {req.status === 'APPROVED' ? 'Accepted' : 'Rejected'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500">{req.user?.email} • {new Date(req.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-zinc-400 mt-2 italic">&quot;{req.reason}&quot;</p>
                        </div>
                      </div>
                      
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={async () => {
                              try {
                                const res = await apiFetch(`/api/admin/host-requests/${req.id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ status: 'APPROVED' })
                                });
                                if (res.ok) {
                                  alert('Request Approved! User promoted to Admin.');
                                  fetchData(); // Refresh list
                                }
                              } catch (e) { console.error(e); }
                            }}
                            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-400 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await apiFetch(`/api/admin/host-requests/${req.id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ status: 'REJECTED' })
                                });
                                if (res.ok) {
                                  alert('Request Rejected.');
                                  fetchData(); // Refresh list
                                }
                              } catch (e) { console.error(e); }
                            }}
                            className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Launch Event</h1>
                <p className="text-zinc-500 mt-2">Draft and publish a new hackathon competition.</p>
              </div>
              <button 
                onClick={() => setActiveTab('hackathons')}
                className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all border border-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <form onSubmit={handleCreateHackathon} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Hackathon Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Global AI Summit 2024"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the mission, prize pool, and tracks..."
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Start Date</label>
                      <input
                        required
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">End Date</label>
                      <input
                        required
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Mode</label>
                      <select
                        value={formData.mode}
                        onChange={e => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white appearance-none cursor-pointer"
                      >
                        <option value="ONLINE">Online (Remote)</option>
                        <option value="IN_PERSON">In-Person</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Target Domain / Tag</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          value={formData.tags}
                          onChange={e => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white appearance-none cursor-pointer"
                        >
                          {domains.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {formData.tags === 'Others' && (
                          <input
                            required
                            type="text"
                            value={customTag}
                            onChange={e => setCustomTag(e.target.value)}
                            placeholder="Specify domain..."
                            className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Application URL</label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://hackathon.com/apply"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">City (If In-Person)</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Event Poster</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="Or paste direct image URL..."
                          className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-white font-medium"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => setPosterFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full px-5 py-4 bg-[#050507] border border-zinc-800 rounded-2xl text-zinc-500 flex items-center gap-3 font-medium">
                            <Globe className="h-5 w-5 text-indigo-500" />
                            <span>{posterFile ? posterFile.name : 'Upload file from local...'}</span>
                          </div>
                        </div>
                      </div>
                      {(formData.imageUrl || posterFile) && (
                        <div className="mt-4 relative w-full h-56 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                          <Image
                            src={posterFile ? URL.createObjectURL(posterFile) : formData.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <button 
                            onClick={() => { setPosterFile(null); setFormData({ ...formData, imageUrl: '' }); }}
                            className="absolute top-4 right-4 p-2 bg-black/80 rounded-full text-white hover:bg-red-500 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {success && (
                    <div className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold">Hackathon published successfully! Redirecting...</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">{error}</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> PUBLISHING...</>
                      ) : (
                        <><Plus className="h-6 w-6" /> PUBLISH HACKATHON</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
