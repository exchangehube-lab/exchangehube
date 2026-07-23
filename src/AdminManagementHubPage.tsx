import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Cpu, Hash, ChevronRight } from 'lucide-react';
import { AdminLayout } from './AdminPages';

export function AdminManagementHubPage() {
  useEffect(() => {
    document.title = 'Management | ExchangeHube Admin';
  }, []);
  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2">Management</h1>
        <p className="text-[#B8C0D0] mb-8">Manage users, bots, and channels across the platform.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/users" className="bg-[#070b1a] border border-white/5 hover:border-purple-500/30 rounded-3xl p-6 group transition-all flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              Users
              <ChevronRight className="w-5 h-5 text-[#B8C0D0] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[#B8C0D0] text-sm">Manage all registered users. View profiles, manage statuses, and monitor activity.</p>
          </Link>

          <Link to="/admin/bots" className="bg-[#070b1a] border border-white/5 hover:border-purple-500/30 rounded-3xl p-6 group transition-all flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              Bots
              <ChevronRight className="w-5 h-5 text-[#B8C0D0] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[#B8C0D0] text-sm">Manage all published bots. Review ratings, suspend bots, or remove them entirely.</p>
          </Link>

          <Link to="/admin/channels" className="bg-[#070b1a] border border-white/5 hover:border-purple-500/30 rounded-3xl p-6 group transition-all flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Hash className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              Channels
              <ChevronRight className="w-5 h-5 text-[#B8C0D0] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[#B8C0D0] text-sm">Manage all existing channels. View member counts, suspend channels, or delete them.</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
