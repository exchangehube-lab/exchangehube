const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
const target = `      } else if (payload.eventType === 'UPDATE') {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? (payload.new as PersonalMessage) : msg));
      }`;

const replacement = `      } else if (payload.eventType === 'UPDATE') {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? (payload.new as PersonalMessage) : msg));
      } else if (payload.eventType === 'DELETE') {
        setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
      }`;

if (code.includes(target) && !code.includes("payload.eventType === 'DELETE'")) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/PersonalChatWindow.tsx', code);
}
