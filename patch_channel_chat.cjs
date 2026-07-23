const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

const target = `  const canPost = !isBanned && isMember && (channelData?.postPermission !== 'admin' || isAdmin);

  return (
    <DashboardLayout>`;

const replacement = `  const canPost = !isBanned && isMember && (channelData?.postPermission !== 'admin' || isAdmin);

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="flex h-screen w-full items-center justify-center bg-[#050816] text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/ChannelChatPage.tsx', code);
  console.log("Patched ChannelChatPage successfully");
} else {
  console.log("Target not found in ChannelChatPage");
}
