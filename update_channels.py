import sys
import re

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# Replace APP_DOMAIN
app_domain = """const APP_DOMAIN = 'eh.me';

export function ChannelsPage() {"""
content = content.replace("export function ChannelsPage() {", app_domain)

# Replace states
old_states = """  const [channelBio, setChannelBio] = useState('');
  const [channelLink, setChannelLink] = useState('');
  const [channelType, setChannelType] = useState('Public Channel');
  const [postPermission, setPostPermission] = useState('admin');
  const [linkValid, setLinkValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!channelLink) {
      setLinkValid(null);
      return;
    }
    try {
      new URL(channelLink);
      setLinkValid(true);
    } catch {
      setLinkValid(false);
    }
  }, [channelLink]);"""

new_states = """  const [channelBio, setChannelBio] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [inviteCode, setInviteCode] = useState('');
  
  const [channelType, setChannelType] = useState('Public Channel');
  const [postPermission, setPostPermission] = useState('admin');

  useEffect(() => {
    if (channelType === 'Private Channel') {
      if (!inviteCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for(let i=0; i<11; i++) {
           code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setInviteCode(code);
      }
      return;
    }
    
    if (!channelUsername) {
      setUsernameStatus('idle');
      return;
    }
    
    const isValid = /^[a-z0-9_]{5,32}$/.test(channelUsername);
    if (!isValid) {
      setUsernameStatus('invalid');
      return;
    }
    
    setUsernameStatus('checking');
    const checkUsername = async () => {
      try {
        const q = query(collection(db, 'channels'), where('channelUsername', '==', channelUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [channelUsername, channelType, inviteCode]);"""

content = content.replace(old_states, new_states)

# Replace handleSubmit
old_submit = """  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName || (!logoFile && !logoPreview) || !channelType || !channelBio || !channelLink) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      new URL(channelLink);
    } catch {
      setMessage("Please enter a valid URL for Channel Link.");
      return;
    }"""

new_submit = """  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName || (!logoFile && !logoPreview) || !channelType || !channelBio) {
      setMessage("Please fill in all required fields.");
      return;
    }
    
    if (channelType === 'Public Channel' && usernameStatus !== 'available') {
      setMessage("Please enter a valid and available username.");
      return;
    }"""

content = content.replace(old_submit, new_submit)

# Replace addDoc
old_adddoc = """      await addDoc(collection(db, 'channels'), {
        channelName,
        channelLink,
        channelImageURL: finalImageURL,
        channelType,
        postPermission,
        channelBio,
        status: "pending",
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });"""

new_adddoc = """      const finalLink = channelType === 'Public Channel' ? `${APP_DOMAIN}/${channelUsername}` : `${APP_DOMAIN}/+${inviteCode}`;
      await addDoc(collection(db, 'channels'), {
        channelName,
        channelUsername: channelType === 'Public Channel' ? channelUsername : null,
        channelLink: finalLink,
        channelImageURL: finalImageURL,
        channelType,
        postPermission,
        channelBio,
        status: "pending",
        ownerUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });"""

content = content.replace(old_adddoc, new_adddoc)

# Replace resets
old_reset = """      setChannelName('');
      setChannelLink('');
      setChannelType('Public Channel');
      setPostPermission('admin');
      setLinkValid(null);
      setChannelBio('');
      setLogoFile(null);
      setLogoPreview('');"""

new_reset = """      setChannelName('');
      setChannelUsername('');
      setInviteCode('');
      setChannelType('Public Channel');
      setPostPermission('admin');
      setChannelBio('');
      setLogoFile(null);
      setLogoPreview('');"""

content = content.replace(old_reset, new_reset)

# Replace form
old_form = """              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Link <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={channelLink}
                  onChange={(e) => setChannelLink(e.target.value)}
                  placeholder={channelType === 'Public Channel' ? "https://t.me/yourchannel or https://discord.gg/..." : "Paste your private invite link."}
                  className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                    channelLink ? (linkValid ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500') : 'border-white/5 focus:border-purple-500/50'
                  }`}
                />
                {channelLink && (
                  <p className={`text-sm mt-2 flex items-center gap-1 ${linkValid ? 'text-green-400' : 'text-red-400'}`}>
                    {linkValid ? (
                      <>✅ {channelType === 'Public Channel' ? 'Channel link is valid.' : 'Invite link is valid.'}</>
                    ) : (
                      <>❌ {channelType === 'Public Channel' ? 'Please enter a valid channel link.' : 'Invalid invite link.'}</>
                    )}
                  </p>
                )}
              </div>"""

new_form = """              {channelType === 'Public Channel' ? (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Username <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">{APP_DOMAIN}/</span>
                    <input
                      type="text"
                      value={channelUsername}
                      onChange={(e) => setChannelUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      maxLength={32}
                      className={`w-full bg-black/20 border rounded-xl pl-[72px] pr-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                        channelUsername ? (usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' : usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' : 'border-purple-500/50 focus:border-purple-500') : 'border-white/5 focus:border-purple-500/50'
                      }`}
                    />
                  </div>
                  {channelUsername && (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${usernameStatus === 'available' ? 'text-green-400' : usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'text-red-400' : 'text-purple-400'}`}>
                      {usernameStatus === 'available' && <>✅ This username is available.</>}
                      {usernameStatus === 'taken' && <>❌ This username is already taken.</>}
                      {usernameStatus === 'invalid' && <>❌ 5-32 chars, lowercase, numbers, underscores only.</>}
                      {usernameStatus === 'checking' && <>⏳ Checking availability...</>}
                    </p>
                  )}
                  {channelUsername && usernameStatus === 'available' && (
                    <p className="text-sm text-[#B8C0D0] mt-1">Preview: {APP_DOMAIN}/{channelUsername}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Invite Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-[#B8C0D0] overflow-hidden text-ellipsis whitespace-nowrap">
                      {APP_DOMAIN}/+{inviteCode}
                    </div>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${APP_DOMAIN}/+${inviteCode}`)}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
              )}"""

content = content.replace(old_form, new_form)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)

