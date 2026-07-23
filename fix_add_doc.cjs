const fs = require('fs');

function sanitize(filepath, collectionName) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace
  // const docRef = await addDoc(collection(db, 'personal_messages'), {
  //   ...message,
  //   created_at: new Date().toISOString(),
  //   is_read: false,
  //   delivered: false,
  //   seen: false
  // });
  
  if (collectionName === 'personal_messages') {
    content = content.replace(/const docRef = await addDoc\(collection\(db, 'personal_messages'\), \{([\s\S]*?)\}\);/, (match, body) => {
      return `const data = {${body}};
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    const docRef = await addDoc(collection(db, 'personal_messages'), cleanData);`;
    });
  } else if (collectionName === 'channel_messages') {
    content = content.replace(/const docRef = await addDoc\(collection\(db, 'channel_messages'\), \{([\s\S]*?)\}\);/, (match, body) => {
      return `const data = {${body}};
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    const docRef = await addDoc(collection(db, 'channel_messages'), cleanData);`;
    });
  }

  fs.writeFileSync(filepath, content);
}

sanitize('src/messaging/services/personalMessageService.ts', 'personal_messages');
sanitize('src/messaging/services/channelMessageService.ts', 'channel_messages');

