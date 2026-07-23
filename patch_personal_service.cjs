const fs = require('fs');
let code = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');
const target = `  async getMessages(chatId: string): Promise<PersonalMessage[]> {`;

const replacement = `  async getRecentConversations(): Promise<PersonalMessage[]> {
    const { data, error } = await supabase
      .from('personal_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    // Get unique conversations by chat_id
    const uniqueChats = new Map<string, PersonalMessage>();
    for (const msg of (data as PersonalMessage[])) {
      if (!uniqueChats.has(msg.chat_id)) {
        uniqueChats.set(msg.chat_id, msg);
      }
    }
    
    return Array.from(uniqueChats.values());
  },

  async getMessages(chatId: string): Promise<PersonalMessage[]> {`;

if (!code.includes('getRecentConversations')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/messaging/services/personalMessageService.ts', code);
}
