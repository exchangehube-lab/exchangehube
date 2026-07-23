const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');
const target = `export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exchangehube_profile_pics");`;

const replacement = `export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!auth.currentUser) throw new Error("Unauthenticated. Please log in to upload files.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image file is too large. Maximum size is 10MB");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exchangehube_profile_pics");`;

code = code.replace(target, replacement);
fs.writeFileSync('src/DashboardPages.tsx', code);
