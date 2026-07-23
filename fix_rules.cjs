const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// We want to remove personalChats entirely.
rules = rules.replace(/    match \/personalChats\/\{chatId\} {[\s\S]*?    }/g, '');

// And we want to remove the nested messages in channels
rules = rules.replace(/      match \/messages\/\{messageId\} {[\s\S]*?      }/g, '');

fs.writeFileSync('firestore.rules', rules);
console.log("Rules fixed");
