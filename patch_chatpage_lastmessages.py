import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_last = """      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const msgDoc = snapshot.docs[0];
          setLastMessages(prev => ({
            ...prev,
            [ch.id]: { id: msgDoc.id, ...msgDoc.data() }
          }));
        }
      });
      unsubscribers.push(unsub);"""

new_last = """      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const msgDoc = snapshot.docs[0];
          setLastMessages(prev => ({
            ...prev,
            [ch.id]: { id: msgDoc.id, ...msgDoc.data() }
          }));
        }
      }, (error) => {
        console.error("Error fetching last message:", error);
      });
      unsubscribers.push(unsub);"""

if old_last in content:
    content = content.replace(old_last, new_last)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("Patched last messages error handler.")
else:
    print("Could not find last messages block.")
