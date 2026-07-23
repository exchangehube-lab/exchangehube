const fs = require('fs');

let content = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const target1 = `const matchesCategory = category === 'All' || channel.channelType === category;`;
const replacement1 = `const matchesCategory = category === 'All' || (category === 'Joined' ? channel.members?.includes(currentUser?.uid) : channel.channelType === category);`;

content = content.replace(target1, replacement1);

const target2 = `{['All', 'Public Channel', 'Private Channel'].map((cat) => (`;
const replacement2 = `{['All', 'Joined', 'Public Channel', 'Private Channel'].map((cat) => (`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Success Categories Patch");
