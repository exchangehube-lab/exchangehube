import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

import_stmt = 'import { BotCard } from "./components/BotCard";'
new_import = """import { BotCard } from "./components/BotCard";
import { ImagePickerOptionsModal } from './components/ImagePickerOptionsModal';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exchangehube_profile_pics");

  const res = await fetch(`https://api.cloudinary.com/v1_1/p0w589ih/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to upload image");
  }
  const data = await res.json();
  return data.secure_url;
};
"""

content = content.replace(import_stmt, new_import)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
