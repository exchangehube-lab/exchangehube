import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# Profile state
old_profile_state = """  const setupFileInputRef = useRef<HTMLInputElement>(null);"""
new_profile_state = """  const setupFileInputRef = useRef<HTMLInputElement>(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showSetupPicker, setShowSetupPicker] = useState(false);"""
content = content.replace(old_profile_state, new_profile_state)

# Profile setup avatar wrapper
old_setup_click = """                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer">
                      <Edit className="w-4 h-4" />
                      <input type="file" ref={setupFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSetupSaving} />
                    </label>"""
new_setup_click = """                    <button type="button" disabled={isSetupSaving} onClick={() => setShowSetupPicker(true)} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer disabled:opacity-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <input type="file" ref={setupFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSetupSaving} />"""
content = content.replace(old_setup_click, new_setup_click)

# Profile edit avatar wrapper
old_edit_click = """                  <label className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    <input type="file" ref={profileFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSaving} />
                  </label>"""
new_edit_click = """                  <button type="button" disabled={isSaving} onClick={() => setShowProfilePicker(true)} className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer disabled:opacity-50">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <input type="file" ref={profileFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSaving} />"""
content = content.replace(old_edit_click, new_edit_click)

# Modals
old_profile_end = """      <AnimatePresence>
        {showLogoutConfirm && ("""
new_profile_end = """      <ImagePickerOptionsModal
        isOpen={showSetupPicker}
        onClose={() => setShowSetupPicker(false)}
        hasExistingImage={!!setupPhotoURL}
        onSelectUpload={() => {
          setShowSetupPicker(false);
          setupFileInputRef.current?.click();
        }}
        onRemove={() => {
          setSetupPhotoURL('');
          setSetupPhotoFile(null);
          setShowSetupPicker(false);
        }}
      />
      <ImagePickerOptionsModal
        isOpen={showProfilePicker}
        onClose={() => setShowProfilePicker(false)}
        hasExistingImage={!!profile?.profilePhotoURL}
        onSelectUpload={() => {
          setShowProfilePicker(false);
          profileFileInputRef.current?.click();
        }}
        onRemove={async () => {
          setShowProfilePicker(false);
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { profilePhotoURL: '' });
            setProfile(prev => prev ? { ...prev, profilePhotoURL: '' } : null);
          }
        }}
      />
      <AnimatePresence>
        {showLogoutConfirm && ("""
content = content.replace(old_profile_end, new_profile_end)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
