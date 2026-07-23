const fs = require('fs');

let content = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

// replace getCountFromServer import with onSnapshot
if (!content.includes('onSnapshot')) {
  content = content.replace("import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';", "import { doc, getDoc, collection, getCountFromServer, onSnapshot, query, where } from 'firebase/firestore';");
}

const dashboardRegex = /export function AdminDashboardPage\(\) \{[\s\S]*?(?=export function AdminBotsPage\(\))/;

const newDashboard = `export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalAdmins: 0,
    activeAdmins: 0,
    blockedAdmins: 0,
    bots: 0,
    channels: 0,
    referrals: 0,
    charts: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      let active = 0;
      let blocked = 0;
      snap.forEach(doc => {
        if (doc.data().isBlocked) blocked++;
        else active++;
      });
      setStats(prev => ({ ...prev, totalUsers: snap.size, activeUsers: active, blockedUsers: blocked }));
    });

    const unsubAdmins = onSnapshot(collection(db, 'Admin'), (snap) => {
      let active = 0;
      let blocked = 0;
      snap.forEach(doc => {
        if (doc.data().isActive === false) blocked++;
        else active++;
      });
      setStats(prev => ({ ...prev, totalAdmins: snap.size, activeAdmins: active, blockedAdmins: blocked }));
    });

    const unsubBots = onSnapshot(collection(db, 'bots'), (snap) => {
      setStats(prev => ({ ...prev, bots: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, bots: 0 }))});

    const unsubChannels = onSnapshot(collection(db, 'channels'), (snap) => {
      setStats(prev => ({ ...prev, channels: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, channels: 0 }))});

    const unsubReferrals = onSnapshot(collection(db, 'referrals'), (snap) => {
      setStats(prev => ({ ...prev, referrals: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, referrals: 0 }))});

    const unsubCharts = onSnapshot(collection(db, 'charts'), (snap) => {
      setStats(prev => ({ ...prev, charts: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, charts: 0 }))});

    return () => {
      unsubUsers();
      unsubAdmins();
      unsubBots();
      unsubChannels();
      unsubReferrals();
      unsubCharts();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <p className="text-sm text-[#B8C0D0] mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400"></span>{stats.activeUsers} Active</div>
              <div className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400"></span>{stats.blockedUsers} Blocked</div>
            </div>
          </div>

          <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <p className="text-sm text-[#B8C0D0] mb-1">Total Admins</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalAdmins}</h3>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400"></span>{stats.activeAdmins} Active</div>
              <div className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span>{stats.blockedAdmins} Blocked</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Bots', value: stats.bots, icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { title: 'Total Channels', value: stats.channels, icon: Hash, color: 'text-pink-400', bg: 'bg-pink-400/10' },
            { title: 'Referral Links', value: stats.referrals, icon: LinkIcon, color: 'text-green-400', bg: 'bg-green-400/10' },
            { title: 'Total Charts', value: stats.charts, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${stat.bg}\`}>
                    <Icon className={\`w-6 h-6 \${stat.color}\`} />
                  </div>
                  <div>
                    <p className="text-sm text-[#B8C0D0] mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
`;

content = content.replace(dashboardRegex, newDashboard);
fs.writeFileSync('src/AdminPages.tsx', content);
