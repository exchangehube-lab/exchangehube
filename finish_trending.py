import sys

with open('update_trending.py.tmp', 'r') as f:
    content = f.read()

old_empty = """        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No published bots available.</h3>
            <p className="text-[#B8C0D0] max-w-md mx-auto">
              {searchTerm ? "No bots match your search criteria." : "Check back later for new trending bots."}
            </p>
          </div>
        )}
      </div>"""

new_empty = """        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {(filterMine !== 'All' || filterMiningType !== 'All') ? "No bots found matching your filters." : "No published bots available."}
            </h3>
            <p className="text-[#B8C0D0] max-w-md mx-auto mb-6">
              {searchTerm ? "No bots match your search criteria." : "Check back later for new trending bots."}
            </p>
            {(filterMine !== 'All' || filterMiningType !== 'All' || searchTerm) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  handleResetFilter();
                }}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium text-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}></div>
          <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-md w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">Filter Bots</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#B8C0D0] mb-3">Mine</label>
              <div className="grid grid-cols-2 gap-3">
                {['All', 'Free', 'Paid', 'Free/Paid'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setTempFilterMine(opt)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${tempFilterMine === opt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-[#B8C0D0] mb-3">Mining Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['All', 'Automatic', 'Manual'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setTempFilterMiningType(opt)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${tempFilterMiningType === opt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={handleResetFilter}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
              >
                Reset
              </button>
              <button 
                onClick={handleApplyFilter}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}"""

content = content.replace(old_empty, new_empty)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
