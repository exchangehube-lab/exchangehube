import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# 1. State Variables
old_state = """  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {"""
new_state = """  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterMine, setFilterMine] = useState('All');
  const [filterMiningType, setFilterMiningType] = useState('All');
  const [tempFilterMine, setTempFilterMine] = useState('All');
  const [tempFilterMiningType, setTempFilterMiningType] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleOpenFilter = () => {
    setTempFilterMine(filterMine);
    setTempFilterMiningType(filterMiningType);
    setShowFilterModal(true);
  };

  const handleApplyFilter = () => {
    setFilterMine(tempFilterMine);
    setFilterMiningType(tempFilterMiningType);
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setTempFilterMine('All');
    setTempFilterMiningType('All');
    setFilterMine('All');
    setFilterMiningType('All');
    setShowFilterModal(false);
  };

  useEffect(() => {"""
content = content.replace(old_state, new_state)

# 2. filter Logic
old_filter = """  const filteredBots = bots.filter(bot => 
    bot.botName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );"""
new_filter = """  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.botName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMine = filterMine === 'All' || bot.category === filterMine;
    const matchesType = filterMiningType === 'All' || bot.accessType === filterMiningType;

    return matchesSearch && matchesMine && matchesType;
  });"""
content = content.replace(old_filter, new_filter)

# 3. Filter button
old_search_html = """        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search trending bots..." 
              className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
          </div>
        </div>"""
new_search_html = """        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trending bots..." 
                className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
              />
            </div>
            <button 
              onClick={handleOpenFilter}
              className="px-4 py-3 bg-[#070b1a] border border-white/5 rounded-xl text-[#B8C0D0] hover:text-white hover:border-white/10 transition-colors flex items-center justify-center shrink-0"
              title="Filter"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>"""
content = content.replace(old_search_html, new_search_html)

# 4. No bots and Modal insertion
# We need to insert the modal just before the last `</div>` of the component or at the end.
# Actually we can search for the end of the component.
# Let's replace the `) : filteredBots.length > 0 ? (` with empty state logic.

# Oh wait, we need to modify the "else" part of `filteredBots.length > 0`.
# Since there is currently no "else" part or if it's there we need to find it.
with open('update_trending.py.tmp', 'w') as f:
    f.write(content)
