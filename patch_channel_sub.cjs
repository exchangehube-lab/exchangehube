const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
const target = `    const subscription = channelMessageService.subscribeToChannel(channelId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new as ChannelMessage]);
      }
    });`;

const replacement = `    const subscription = channelMessageService.subscribeToChannel(channelId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new as ChannelMessage]);
      } else if (payload.eventType === 'UPDATE') {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? (payload.new as ChannelMessage) : msg));
      } else if (payload.eventType === 'DELETE') {
        setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
      }
    });`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/ChannelChatPage.tsx', code);
}
