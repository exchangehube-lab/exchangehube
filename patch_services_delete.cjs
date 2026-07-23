const fs = require('fs');

const updateDeletePersonal = `
  async deleteMessage(messageId: string, forAll: boolean) {
    const updateData = forAll 
      ? { deleted_for_all: true, content: 'This message was deleted', message_type: 'text', file_url: null, voice_url: null }
      : { deleted: true };
      
    const { error } = await supabase
      .from('personal_messages')
      .update(updateData)
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let personal = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');
personal = personal.replace(
  "async editMessage", 
  updateDeletePersonal + "\n  async editMessage"
);
fs.writeFileSync('src/messaging/services/personalMessageService.ts', personal);

const updateDeleteChannel = `
  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('channel_messages')
      .update({ deleted_for_all: true, content: 'This message was deleted', message_type: 'text', file_url: null, voice_url: null })
      .eq('id', messageId);
    if (error) throw error;
  },
`;

let channel = fs.readFileSync('src/messaging/services/channelMessageService.ts', 'utf8');
channel = channel.replace(
  "async editMessage", 
  updateDeleteChannel + "\n  async editMessage"
);
fs.writeFileSync('src/messaging/services/channelMessageService.ts', channel);

