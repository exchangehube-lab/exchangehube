const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

const targetUpload = `      const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration is missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.");
      }

      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary.");
      }

      const cloudinaryData = await res.json();
      botImageURL = cloudinaryData.secure_url;`;

const newUpload = `      const cloudName = "p0w589ih";
      const uploadPreset = "exchangehube_bot_images";
      
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload bot image. Please try again.");
      }

      const cloudinaryData = await res.json();
      botImageURL = cloudinaryData.secure_url;`;

content = content.replace(targetUpload, newUpload);
fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Patched PublishBotPage Cloudinary config");
