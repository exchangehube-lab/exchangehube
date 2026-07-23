import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_setup_url = """      let finalPhotoURL = '';
      if (setupPhotoFile) {
        try {
          finalPhotoURL = await uploadToCloudinary(setupPhotoFile);
        } catch (uploadErr: any) {
          console.error("Photo upload error:", uploadErr);
          setSetupError(`Failed to upload photo: ${uploadErr.message}`);
          setIsSetupSaving(false);
          return;
        }
      } else if (user.photoURL) {
        finalPhotoURL = user.photoURL; // fallback to google photo if they didn't upload custom
      }"""

new_setup_url = """      let finalPhotoURL = setupPhotoURL || '';
      if (setupPhotoFile) {
        try {
          finalPhotoURL = await uploadToCloudinary(setupPhotoFile);
        } catch (uploadErr: any) {
          console.error("Photo upload error:", uploadErr);
          setSetupError(`Failed to upload photo: ${uploadErr.message}`);
          setIsSetupSaving(false);
          return;
        }
      }"""

content = content.replace(old_setup_url, new_setup_url)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
