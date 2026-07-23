const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff, Search, ChevronUp, ChevronDown } from 'lucide-react';"
);

// State
code = code.replace(
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);",
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);\n  const [isSearching, setIsSearching] = useState(false);\n  const [searchQuery, setSearchQuery] = useState('');\n  const [searchResults, setSearchResults] = useState<string[]>([]);\n  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);"
);


// Effects and Helper
const searchLogic = `
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = messages.filter(msg => {
      if (msg.deleted_for_all) return false;
      const textMatch = msg.content?.toLowerCase().includes(query);
      const fileMatch = msg.file_name?.toLowerCase().includes(query);
      return textMatch || fileMatch;
    }).map(m => m.id);
    
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(results.length - 1);
    } else {
      setCurrentSearchIndex(-1);
    }
  }, [messages, searchQuery]);

  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults[currentSearchIndex]) {
       scrollToMessage(searchResults[currentSearchIndex]);
    }
  }, [currentSearchIndex, searchResults]);

  const handleNextSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    }
  };
  const handlePrevSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(\`(\${query})\`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-500/50 text-white rounded px-0.5">{part}</span> 
            : part
        )}
      </>
    );
  };
`;

code = code.replace("const handleDelete = async () => {", searchLogic + "\n\n  const handleDelete = async () => {");


// Header
const oldHeaderRegex = /<div className="h-\[70px\] border-b border-white\/10 px-6 flex items-center gap-4 bg-white\/5 backdrop-blur-md sticky top-0 z-10 shrink-0">[\s\S]*?<div className="flex flex-col min-w-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="h-[70px] border-b border-white/10 px-6 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/channels')} className="md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xl font-bold text-white truncate"># {channelData?.name || 'Loading...'}</h2>
              <div className="text-xs text-white/50 truncate flex items-center gap-2">
                <span>{channelData?.members?.length || 0} members</span>
                {channelData?.description && (
                  <>
                    <span>•</span>
                    <span className="truncate">{channelData.description}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search UI */}
          <div className="flex items-center ml-4 shrink-0">
            {isSearching ? (
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <Search className="w-4 h-4 text-white/50 hidden md:block" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-white w-24 md:w-48 placeholder:text-white/30"
                  autoFocus
                />
                {searchQuery && (
                  <div className="flex items-center gap-1 text-xs text-white/50 border-l border-white/10 pl-2 ml-1">
                    <span>{searchResults.length > 0 ? currentSearchIndex + 1 : 0}/{searchResults.length}</span>
                    <button onClick={handlePrevSearch} disabled={searchResults.length === 0} className="p-1 hover:text-white disabled:opacity-50">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleNextSearch} disabled={searchResults.length === 0} className="p-1 hover:text-white disabled:opacity-50">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:text-white text-white/50 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>`;

code = code.replace(oldHeaderRegex, newHeader);


// Content Highlight
code = code.replace(
  /\{msg\.content && <p className=\{(.*?)\}>\{msg\.content\}<\/p>\}/g,
  "{msg.content && <p className={$1}>{highlightText(msg.content, searchQuery)}</p>}"
);

// File Highlight
code = code.replace(
  /<span className="text-sm font-medium truncate">\{msg\.file_name \|\| 'Attachment'\}<\/span>/g,
  '<span className="text-sm font-medium truncate">{highlightText(msg.file_name || \'Attachment\', searchQuery)}</span>'
);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
