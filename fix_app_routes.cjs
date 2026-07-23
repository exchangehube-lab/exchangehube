const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const adminRouteDef = `function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const docRef = doc(db, 'Admin', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin' && docSnap.data().isActive === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  if (isAdmin === null) return <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
}`;

if (!appContent.includes('AdminProtectedRoute')) {
  appContent = appContent.replace("function App() {", adminRouteDef + "\n\nfunction App() {");
}

appContent = appContent.replace(
  '<Route path="/Admin/dashboard" element={<AdminDashboardPage />} />',
  '<Route path="/Admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/users" element={<AdminUsersPage />} />',
  '<Route path="/Admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/bots" element={<AdminBotsPage />} />',
  '<Route path="/Admin/bots" element={<AdminProtectedRoute><AdminBotsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/charts" element={<AdminChartsPage />} />',
  '<Route path="/Admin/charts" element={<AdminProtectedRoute><AdminChartsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/referrals" element={<AdminReferralsPage />} />',
  '<Route path="/Admin/referrals" element={<AdminProtectedRoute><AdminReferralsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/channels" element={<AdminChannelsPage />} />',
  '<Route path="/Admin/channels" element={<AdminProtectedRoute><AdminChannelsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/notifications" element={<AdminNotificationsPage />} />',
  '<Route path="/Admin/notifications" element={<AdminProtectedRoute><AdminNotificationsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/settings" element={<AdminSettingsPage />} />',
  '<Route path="/Admin/settings" element={<AdminProtectedRoute><AdminSettingsPage /></AdminProtectedRoute>} />'
);
appContent = appContent.replace(
  '<Route path="/Admin/management" element={<AdminManagementPage />} />',
  '<Route path="/Admin/management" element={<AdminProtectedRoute><AdminManagementPage /></AdminProtectedRoute>} />'
);

fs.writeFileSync('src/App.tsx', appContent);
