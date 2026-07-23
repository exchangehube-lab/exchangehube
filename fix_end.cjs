const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// I need to undo the bad replacement.
// The file is currently ending with:
/*
        <ForwardModal 
          message={forwardingMessage} 
          userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }} 
          onClose={() => setForwardingMessage(null)} 
        />
      )}
        </div>
        
        {showSharedMedia && (
          <SharedMediaSidebar 
            messages={messages}
            userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}
            currentUserId={currentUser?.uid || ''}
            onClose={() => setShowSharedMedia(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
*/
const badEnd = `      )}
        </div>
        
        {showSharedMedia && (
          <SharedMediaSidebar 
            messages={messages}
            userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}
            currentUserId={currentUser?.uid || ''}
            onClose={() => setShowSharedMedia(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}`;

const goodEnd = `      )}
        
      {showSharedMedia && (
        <SharedMediaSidebar 
          messages={messages}
          userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}
          currentUserId={currentUser?.uid || ''}
          onClose={() => setShowSharedMedia(false)}
        />
      )}
      </div>
    </DashboardLayout>
  );
}`;

code = code.replace(badEnd, goodEnd);
fs.writeFileSync('src/PersonalChatWindow.tsx', code);
