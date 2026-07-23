import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

import re

# Let's fix the useEffect for fetching channels
pattern = re.compile(r'  // Fetch joined channels\n  useEffect\(\(\) => \{\n    if \(!currentUser\) return;\n\n    const channelsRef = collection\(db, \'channels\'\);\n    const unsubChannels = onSnapshot\(channelsRef, \(snapshot\) => \{\n      const fetchedChannels = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);\n      const myChannels = fetchedChannels\.filter\(\(c: any\) => c\.members\?\.includes\(currentUser\?\.uid\) && c\.status === \'active\'\);\n      setChannels\(myChannels\);\n      setChannelsLoading\(false\);\n    \}\);\n\n    return \(\) => unsubChannels\(\);\n  \}, \[\]\);', re.MULTILINE)

new_code = """  // Fetch joined channels
  useEffect(() => {
    if (!currentUser) {
      setChannels([]);
      return;
    }

    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(currentUser?.uid) && c.status === 'active');
      setChannels(myChannels);
      setChannelsLoading(false);
    });

    return () => unsubChannels();
  }, [currentUser]);"""

if not pattern.search(content):
    print("Could not find the target code to replace!")
else:
    content = pattern.sub(new_code, content)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("Successfully patched ChatPage.tsx")

