const fs = require('fs');

// Personal Messages
let code = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');
code = code.replace(/orderBy\('created_at', 'desc'\),\s*/g, '');
code = code.replace(/orderBy\('created_at', 'asc'\)/g, '');
code = code.replace(/const snap = await getDocs\(q\);\n\s*return snap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as PersonalMessage\)\);/g, `const snap = await getDocs(q);
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PersonalMessage));
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());`);
fs.writeFileSync('src/messaging/services/personalMessageService.ts', code);

// Channel Messages
let cCode = fs.readFileSync('src/messaging/services/channelMessageService.ts', 'utf8');
cCode = cCode.replace(/,\s*orderBy\('created_at', 'asc'\)/g, '');
cCode = cCode.replace(/const snap = await getDocs\(q\);\n\s*return snap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as ChannelMessage\)\);/g, `const snap = await getDocs(q);
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChannelMessage));
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());`);
fs.writeFileSync('src/messaging/services/channelMessageService.ts', cCode);

// Notifications
let nCode = fs.readFileSync('src/messaging/services/notificationService.ts', 'utf8');
nCode = nCode.replace(/,\s*orderBy\('created_at', 'desc'\)/g, '');
nCode = nCode.replace(/const snap = await getDocs\(q\);\n\s*return snap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as Notification\)\);/g, `const snap = await getDocs(q);
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());`);
fs.writeFileSync('src/messaging/services/notificationService.ts', nCode);

