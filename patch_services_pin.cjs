const fs = require('fs');

const updatePinPersonal = `
  async pinMessage(messageId: string, pinned: boolean) {
    const { error } = await supabase
      .from('personal_messages')
      .update({ pinned })
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let personal = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');
personal = personal.replace(
  "async editMessage", 
  updatePinPersonal + "\n  async editMessage"
);
fs.writeFileSync('src/messaging/services/personalMessageService.ts', personal);

const updatePinChannel = `
  async pinMessage(messageId: string, pinned: boolean) {
    const { error } = await supabase
      .from('channel_messages')
      .update({ pinned })
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let channel = fs.readFileSync('src/messaging/services/channelMessageService.ts', 'utf8');
channel = channel.replace(
  "async editMessage", 
  updatePinChannel + "\n  async editMessage"
);
fs.writeFileSync('src/messaging/services/channelMessageService.ts', channel);

