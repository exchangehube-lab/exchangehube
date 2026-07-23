import sys

with open('src/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace('import { getFirestore } from "firebase/firestore";', 'import { getFirestore, initializeFirestore } from "firebase/firestore";')
content = content.replace('export const db = getFirestore(app);', 'export const db = initializeFirestore(app, { experimentalForceLongPolling: true });')

with open('src/firebase.ts', 'w') as f:
    f.write(content)
