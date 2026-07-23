const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

code = code.replace(
  `  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();`,
  `  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setMessage("You must be logged in.");
      return;
    }`
);

code = code.replace(
  `  const handleBotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();`,
  `  const handleBotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setMessage("You must be logged in.");
      return;
    }`
);

fs.writeFileSync('src/DashboardPages.tsx', code);
