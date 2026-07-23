const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

// Replace desktop mapping
const targetDesktop = `          {navItems.map((item, index) => {
            if (item.isSubmenu) {
              const isAnyChildActive = item.subItems.some(sub => location.pathname === sub.path);
              return (
                <div key={index} className="flex flex-col flex-1 min-w-0">
                  <button 
                    onClick={() => setIsBotsExpanded(!isBotsExpanded)}
                    className={\`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all \${isAnyChildActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}\`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={\`w-5 h-5 \${isAnyChildActive ? 'text-purple-400' : ''}\`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronDown className={\`w-4 h-4 transition-transform duration-300 \${isBotsExpanded ? 'rotate-180' : ''}\`} />
                  </button>
                  <div 
                    className={\`overflow-hidden transition-all duration-300 ease-in-out \${isBotsExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}\`}
                  >
                    <div className="flex flex-col gap-1 pl-12 pr-4">
                      {item.subItems.map((sub, subIdx) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <button
                            key={subIdx}
                            onClick={() => navigate(sub.path)}
                            className={\`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm font-medium \${isSubActive ? 'text-white bg-white/10' : 'text-[#B8C0D0] hover:text-white hover:bg-white/5'}\`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = location.pathname.startsWith(item.path);
            return (
              <button 
                key={index}
                onClick={() => navigate(item.path)}
                className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all \${isActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}\`}
              >
                <item.icon className={\`w-5 h-5 \${isActive ? 'text-purple-400' : ''}\`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}`;

const replacementDesktop = `          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button 
                key={index}
                onClick={() => navigate(item.path)}
                className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all \${isActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}\`}
              >
                <item.icon className={\`w-5 h-5 \${isActive ? 'text-purple-400' : ''}\`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}`;

if (code.includes(targetDesktop)) {
  code = code.replace(targetDesktop, replacementDesktop);
} else {
  console.log("targetDesktop not found");
}

fs.writeFileSync('src/DashboardPages.tsx', code);
