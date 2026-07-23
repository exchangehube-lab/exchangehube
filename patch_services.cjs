const fs = require('fs');

function patchService(file, functionName, replaceTo) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { auth }")) {
    code = `import { auth } from '../../firebase';\n` + code;
  }
  
  const targetRegex = new RegExp(`async sendMessage\\(message: [^\\)]+\\): Promise<[^>]+> {\\s*const { data, error } = await supabase\\s*.from\\('[^']+'\\)\\s*.insert\\(\\[message\\]\\)\\s*.select\\(\\)\\s*.single\\(\\);\\s*if \\(error\\) throw error;\\s*return data;\\s*}`, 'm');
  
  if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replaceTo);
    fs.writeFileSync(file, code);
    console.log("Patched " + file);
  } else {
    console.log("Regex not matched in " + file);
  }
}

const replaceToPersonal = `async sendMessage(message: Omit<PersonalMessage, 'id' | 'created_at' | 'is_read' | 'delivered' | 'delivered_at' | 'seen' | 'seen_at'>): Promise<PersonalMessage> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    const token = await user.getIdToken();
    
    // We send extra data expected by send-message Edge Function?
    // The previous Express proxy just sent req.body.
    // The PersonalChatWindow passed: conversation_id, sender_uid, receiver_uid, etc.
    // Wait, earlier PersonalChatWindow.tsx passed an object like:
    // { conversation_id, sender_uid, receiver_uid, ... }
    // But then I restored it to:
    // { chat_id, sender_id, content, reply_to }
    // Does the edge function expect a specific shape?
    // Let's pass the message object, which has chat_id, sender_id, content, etc.
    // I need to know what the Edge function expects.
`;
