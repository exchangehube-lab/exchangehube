const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

const regex1 = /await channelMessageService\.sendMessage\(\{\s*channel_id: channelId,\s*sender_id: currentUser\.uid,\s*content: '',\s*message_type: 'voice',\s*file_url: result\.url, voice_url: result\.url,\s*file_name: 'Voice Message',\s*file_size: file\.size,\s*voice_duration: duration,\s*reply_to: replyingTo\?\.id\s*\}\);/;

const replace1 = `const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          channel_id: channelId,
          sender_uid: currentUser.uid,
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
      if (!response.ok) throw new Error('Failed to send voice message');`;

const regex2 = /await channelMessageService\.sendMessage\(\{\s*channel_id: channelId,\s*sender_id: currentUser\.uid,\s*content: '',\s*message_type: msgType,\s*file_url: result\.url, voice_url: result\.url,\s*file_name: file\.name \|\| result\.original_filename,\s*file_size: file\.size \|\| result\.bytes,\s*reply_to: replyingTo\?\.id\s*\}\);/;

const replace2 = `const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          channel_id: channelId,
          sender_uid: currentUser.uid,
          message: '',
          message_type: msgType,
          file_url: result.url,
          voice_url: result.url,
          file_name: file.name || result.original_filename,
          file_size: file.size || result.bytes,
          reply_to: replyingTo?.id
        })
      });
      if (!response.ok) throw new Error('Failed to send file message');`;

const regex3 = /await channelMessageService\.sendMessage\(\{\s*channel_id: channelId,\s*sender_id: currentUser\.uid,\s*content: newMessage\.trim\(\),\s*reply_to: replyingTo\?\.id\s*\}\);/;

const replace3 = `const idToken = await currentUser.getIdToken();
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${idToken}\`
          },
          body: JSON.stringify({
            channel_id: channelId,
            sender_uid: currentUser.uid,
            message: newMessage.trim(),
            message_type: 'text',
            reply_to: replyingTo?.id
          })
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error('Failed to send message: ' + text);
        }`;

if (regex1.test(code)) code = code.replace(regex1, replace1);
if (regex2.test(code)) code = code.replace(regex2, replace2);
if (regex3.test(code)) code = code.replace(regex3, replace3);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
console.log("Patched ChannelChatPage.tsx");
