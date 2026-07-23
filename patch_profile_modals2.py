import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_text = """        ) : null}
      </div>
    </DashboardLayout>"""

new_text = """        ) : null}
      </div>
      <ImagePickerOptionsModal
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
      {cropperState.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.src}
          onClose={() => setCropperState({ isOpen: false, src: '', mode: cropperState.mode })}
          onSave={handleCropperSave}
          onChangeImage={() => {
            setCropperState({ isOpen: false, src: '', mode: cropperState.mode });
            if (cropperState.mode === 'setup') {
              setupFileInputRef.current?.click();
            } else {
              profileFileInputRef.current?.click();
            }
          }}
          title={cropperState.mode === 'setup' ? "Crop Profile Photo" : "Update Profile Photo"}
          description="Your photo helps others recognize you."
        />
      )}
    </DashboardLayout>"""

content = content.replace(old_text, new_text)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
