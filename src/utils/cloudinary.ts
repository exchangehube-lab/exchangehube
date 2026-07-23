import { auth } from '../firebase';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/zip', 'application/x-zip-compressed'
];

export const uploadFileToCloudinary = async (file: File): Promise<{ url: string, resource_type: string, format: string, bytes: number, original_filename: string }> => {
  if (!auth.currentUser) {
    throw new Error("Unauthenticated. Please log in to upload files.");
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
    console.warn("File type might not be fully supported:", file.type);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exchangehube_profile_pics");

  const res = await fetch(`https://api.cloudinary.com/v1_1/p0w589ih/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Cloudinary error:", errorData);
    throw new Error(errorData.error?.message || "Failed to upload file");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    resource_type: data.resource_type,
    format: data.format,
    bytes: data.bytes,
    original_filename: data.original_filename
  };
};
