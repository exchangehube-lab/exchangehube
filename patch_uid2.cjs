const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const target = `      setSending(false);
    }
  };
return (
    <DashboardLayout>`;

const replacement = `      setSending(false);
    }
  };

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
  fs.writeFileSync('src/PersonalChatWindow.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
