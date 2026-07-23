const fs = require('fs');
const content = fs.readFileSync('src/PersonalChatsPage.tsx', 'utf8');

const target = `        const chatsWithUsers: RecentChat[] = [];
        
        for (const msg of conversations) {
          const uids = msg.conversation_id.split('_');
          const otherUid = uids[0] === currentUser.uid ? uids[1] : uids[0];
          
          if (otherUid) {
            const userDoc = await getDoc(doc(db, 'users', otherUid));
            if (userDoc.exists()) {
              chatsWithUsers.push({
                user: { uid: otherUid, ...userDoc.data() } as SearchedUser,
                lastMessage: msg
              });
            } else {
              chatsWithUsers.push({
                user: { uid: otherUid, username: 'deleted_user', fullName: 'Deleted User' },
                lastMessage: msg
              });
            }
          }
        }
        
        setRecentChats(chatsWithUsers);`;

const replacement = `        const chatsWithUsersMap = new Map<string, RecentChat>();
        
        for (const msg of conversations) {
          const uids = msg.conversation_id.split('_');
          const otherUid = uids[0] === currentUser.uid ? uids[1] : uids[0];
          
          if (otherUid && !chatsWithUsersMap.has(otherUid)) {
            const userDoc = await getDoc(doc(db, 'users', otherUid));
            if (userDoc.exists()) {
              chatsWithUsersMap.set(otherUid, {
                user: { uid: otherUid, ...userDoc.data() } as SearchedUser,
                lastMessage: msg
              });
            } else {
              chatsWithUsersMap.set(otherUid, {
                user: { uid: otherUid, username: 'deleted_user', fullName: 'Deleted User' },
                lastMessage: msg
              });
            }
          }
        }
        
        setRecentChats(Array.from(chatsWithUsersMap.values()));`;

if (content.includes(target)) {
  fs.writeFileSync('src/PersonalChatsPage.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Not found");
}
