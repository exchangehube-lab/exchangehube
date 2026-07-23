import sys

content = """
export function AdminChartsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Charts</h1>
        <p className="text-[#B8C0D0]">Charts management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminReferralsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Referral Links</h1>
        <p className="text-[#B8C0D0]">Referrals management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminNotificationsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Notifications</h1>
        <p className="text-[#B8C0D0]">Notifications management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-[#B8C0D0]">Admin settings coming soon.</p>
      </div>
    </AdminLayout>
  );
}
"""

with open('src/AdminPages.tsx', 'a') as f:
    f.write(content)
