const fs = require('fs');

const updateEditPersonal = `
  async editMessage(messageId: string, newContent: string) {
    const { error } = await supabase
      .from('personal_messages')
      .update({ content: newContent, edited: true, edited_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let personal = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');
personal = personal.replace(
  "async markAsDelivered", 
  updateEditPersonal + "\n  async markAsDelivered"
);
fs.writeFileSync('src/messaging/services/personalMessageService.ts', personal);

const updateEditChannel = `
  async editMessage(messageId: string, newContent: string) {
    const { error } = await supabase
      .from('channel_messages')
      .update({ content: newContent, edited: true, edited_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let channel = fs.readFileSync('src/messaging/services/channelMessageService.ts', 'utf8');
channel = channel.replace(
  "subscribeToChannel", 
  updateEditChannel + "\n  subscribeToChannel"
);
fs.writeFileSync('src/messaging/services/channelMessageService.ts', channel);

