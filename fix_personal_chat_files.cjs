const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const regex1 = /await personalMessageService\.sendMessage\(\{\s*chat_id: chatId,\s*sender_id: currentUser\.uid,\s*content: '',\s*message_type: 'voice',\s*file_url: result\.url, voice_url: result\.url,\s*file_name: 'Voice Message',\s*file_size: file\.size,\s*voice_duration: duration,\s*reply_to: replyingTo\?\.id\s*\}\);/;

const replace1 = `const idToken = await currentUser.getIdToken();
      const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          conversation_id: chatId,
          sender_uid: currentUser.uid,
          receiver_uid: targetUserId,
          sender_username: currentUserProfile.username,
          receiver_username: targetUser.username,
          sender_photo: currentUserProfile.photoURL,
          receiver_photo: targetUser.photoURL,
          message: '',
          message_type: 'voice',
          file_url: result.url,
          voice_url: result.url,
          file_name: 'Voice Message',
          file_size: file.size,
          voice_duration: duration,
          reply_to: replyingTo?.id
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send voice message');
      }`;

const regex2 = /await personalMessageService\.sendMessage\(\{\s*chat_id: chatId,\s*sender_id: currentUser\.uid,\s*content: '',\s*message_type: msgType,\s*file_url: result\.url, voice_url: result\.url,\s*file_name: file\.name \|\| result\.original_filename,\s*file_size: file\.size \|\| result\.bytes,\s*reply_to: replyingTo\?\.id\s*\}\);/;

const replace2 = `const idToken = await currentUser.getIdToken();
      const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          conversation_id: chatId,
          sender_uid: currentUser.uid,
          receiver_uid: targetUserId,
          sender_username: currentUserProfile.username,
          receiver_username: targetUser.username,
          sender_photo: currentUserProfile.photoURL,
          receiver_photo: targetUser.photoURL,
          message: '',
          message_type: msgType,
          file_url: result.url,
          voice_url: result.url,
          file_name: file.name || result.original_filename,
          file_size: file.size || result.bytes,
          reply_to: replyingTo?.id
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send file message');
      }`;

if (regex1.test(code)) {
  code = code.replace(regex1, replace1);
} else {
  console.log("regex1 failed");
}

if (regex2.test(code)) {
  code = code.replace(regex2, replace2);
} else {
  console.log("regex2 failed");
}

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
console.log("Done");
