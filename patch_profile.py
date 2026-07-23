import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# Fix ProfilePage state
old_profile_state = """  const [isSetupSaving, setIsSetupSaving] = useState(false);"""

new_profile_state = """  const [isSetupSaving, setIsSetupSaving] = useState(false);
  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string, mode: 'setup' | 'edit'}>({ isOpen: false, src: '', mode: 'setup' });
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);
"""

content = content.replace(old_profile_state, new_profile_state)

# Replace handlePhotoChange
old_profile_handlePhotoChange = """  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      if (needsSetup) setSetupError('Unsupported file format. Use JPG, PNG, or WebP.');
      else setError('Unsupported file format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (needsSetup) setSetupError('File size exceeds 5MB limit.');
      else setError('File size exceeds 5MB limit.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (needsSetup) {
      setSetupPhotoFile(file);
      setSetupPhotoURL(previewUrl);
      setSetupError('');
    } else {
      setEditPhotoFile(file);
      setEditPhotoURL(previewUrl);
      setIsEditing(true); // Auto-enter edit mode if they select a photo
      setError('');
    }
  };"""

new_profile_handlePhotoChange = """  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      if (needsSetup) setSetupError('Unsupported file format. Use JPG, PNG, or WebP.');
      else setError('Unsupported file format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (needsSetup) setSetupError('File size exceeds 5MB limit.');
      else setError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperState({ isOpen: true, src: reader.result as string, mode: needsSetup ? 'setup' : 'edit' });
    };
    reader.readAsDataURL(file);
    
    if (needsSetup) {
      setSetupError('');
      if (setupFileInputRef.current) setupFileInputRef.current.value = '';
    } else {
      setError('');
      if (profileFileInputRef.current) profileFileInputRef.current.value = '';
    }
  };

  const handleCropperSave = async (croppedFile: File, previewUrl: string, setProgress: (msg: string) => void) => {
    const url = await uploadToCloudinary(croppedFile);
    if (cropperState.mode === 'setup') {
      setSetupPhotoURL(url);
      setSetupPhotoFile(null); // URL is ready
    } else {
      setProgress('Saving to Firestore...');
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, { profilePhotoURL: url });
      setProfile(prev => prev ? { ...prev, profilePhotoURL: url } : null);
    }
  };"""

content = content.replace(old_profile_handlePhotoChange, new_profile_handlePhotoChange)

# Remove uploadToCloudinary from inside ProfilePage because we already imported it
import re
content = re.sub(r"  const uploadToCloudinary = async \(file: File\): Promise<string> => \{[\s\S]*?  \};\n\n", "\n", content)

# update input refs in setup form
old_setup_input = """<input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSetupSaving} />"""
new_setup_input = """<input type="file" ref={setupFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSetupSaving} />"""
content = content.replace(old_setup_input, new_setup_input)

# update input refs in edit form
old_edit_input = """<input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSaving} />"""
new_edit_input = """<input type="file" ref={profileFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSaving} />"""
content = content.replace(old_edit_input, new_edit_input)

# Add CropperModal to end of ProfilePage
old_profile_end = """      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b1a]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#172045]/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Log Out</h3>
              <p className="text-[#B8C0D0] mb-6">Are you sure you want to log out of ExchangeHube?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}"""

new_profile_end = """      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b1a]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#172045]/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Log Out</h3>
              <p className="text-[#B8C0D0] mb-6">Are you sure you want to log out of ExchangeHube?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {cropperState.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.src}
          onClose={() => setCropperState({ ...cropperState, isOpen: false, src: '' })}
          onSave={handleCropperSave}
          onChangeImage={() => {
            setCropperState({ ...cropperState, isOpen: false, src: '' });
            if (cropperState.mode === 'setup') {
              setupFileInputRef.current?.click();
            } else {
              profileFileInputRef.current?.click();
            }
          }}
          cropShape="round"
          title="Crop Profile Picture"
          description="Your profile picture will appear like this."
          successMessage="Profile picture updated successfully."
        />
      )}
    </div>
  );
}"""

content = content.replace(old_profile_end, new_profile_end)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
