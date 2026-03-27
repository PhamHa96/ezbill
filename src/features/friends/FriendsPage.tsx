import React, { useState } from 'react';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  sharedTrips: number;
  totalOwed: number; // positive = they owe you, negative = you owe them
  status: 'friend' | 'pending_sent' | 'pending_received';
}

const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Loan Nguyen',
    username: 'loan.nguyen',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Loan&backgroundColor=ff7da1',
    sharedTrips: 3,
    totalOwed: 120000,
    status: 'friend',
  },
  {
    id: 'f2',
    name: 'Phuong Tran',
    username: 'phuong.tran',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Phuong&backgroundColor=ffa7c4',
    sharedTrips: 1,
    totalOwed: -55000,
    status: 'friend',
  },
  {
    id: 'f3',
    name: 'Minh Le',
    username: 'minh.le99',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Minh&backgroundColor=c084fc',
    sharedTrips: 5,
    totalOwed: 0,
    status: 'friend',
  },
  {
    id: 'f4',
    name: 'Hoa Pham',
    username: 'hoa.pham',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Hoa&backgroundColor=86efac',
    sharedTrips: 0,
    totalOwed: 0,
    status: 'pending_received',
  },
];

const MOCK_SEARCH_RESULTS: Friend[] = [
  {
    id: 's1',
    name: 'An Vo',
    username: 'an.vo',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=An&backgroundColor=fdba74',
    sharedTrips: 0,
    totalOwed: 0,
    status: 'friend',
  },
  {
    id: 's2',
    name: 'Duc Hoang',
    username: 'duc.hoang',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Duc&backgroundColor=67e8f9',
    sharedTrips: 0,
    totalOwed: 0,
    status: 'pending_sent',
  },
];

const fmt = (n: number) => Math.round(Math.abs(n)).toLocaleString();

export const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const confirmedFriends = friends.filter(f => f.status === 'friend');
  const pendingReceived = friends.filter(f => f.status === 'pending_received');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    // Mock: return results not already friends
    setSearchResults(MOCK_SEARCH_RESULTS);
  };

  const handleSendRequest = (id: string) => {
    setSentRequests(prev => new Set(prev).add(id));
  };

  const handleAccept = (id: string) => {
    setFriends(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'friend' as const } : f)
    );
  };

  const handleDecline = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const handleInvite = async (friend: Friend) => {
    const text = `Hey ${friend.name}! Join me on Ezbill to split expenses easily 💸\nDownload: https://ezbill.app`;
    if (navigator.share) {
      await navigator.share({ title: 'Join me on Ezbill', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Invite link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-surface-page animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main">Friends 👥</h1>
          <p className="text-text-muted text-sm font-semibold mt-0.5">
            {confirmedFriends.length} friends · {pendingReceived.length} pending
          </p>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-soft active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-white text-[22px]">person_add</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-5">
        {/* Pending received */}
        {pendingReceived.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
              Friend Requests
            </h2>
            <div className="flex flex-col gap-3">
              {pendingReceived.map(f => (
                <div key={f.id} className="bg-white rounded-3xl p-4 shadow-soft flex items-center gap-3">
                  <img src={f.avatarUrl} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-main text-sm truncate">{f.name}</p>
                    <p className="text-xs text-text-muted">@{f.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecline(f.id)}
                      className="w-9 h-9 rounded-full bg-surface-page flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-text-muted text-[18px]">close</span>
                    </button>
                    <button
                      onClick={() => handleAccept(f.id)}
                      className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-white text-[18px]">check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div>
          <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
            My Friends
          </h2>
          {confirmedFriends.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">group</span>
              </div>
              <p className="text-text-muted font-bold text-sm">No friends yet</p>
              <p className="text-text-muted text-xs mt-1">Add friends to split expenses together</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {confirmedFriends.map(f => (
                <div key={f.id} className="bg-white rounded-3xl p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={f.avatarUrl} alt={f.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-main text-sm">{f.name}</p>
                      <p className="text-xs text-text-muted">@{f.username}</p>
                    </div>
                    <button
                      onClick={() => handleInvite(f)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">share</span>
                      Invite
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#ffd1dc] flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-text-muted font-bold">
                      <span className="material-symbols-outlined text-[14px]">luggage</span>
                      {f.sharedTrips} trips
                    </div>
                    {f.totalOwed !== 0 && (
                      <div className={`ml-auto text-xs font-bold ${f.totalOwed > 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {f.totalOwed > 0
                          ? `Owes you ${fmt(f.totalOwed)}`
                          : `You owe ${fmt(f.totalOwed)}`}
                      </div>
                    )}
                    {f.totalOwed === 0 && (
                      <div className="ml-auto flex items-center gap-1 text-xs font-bold text-text-muted">
                        <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                        Settled up
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Bottom Sheet */}
      {showAddSheet && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowAddSheet(false); setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
          />
          <div className="relative bg-white rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />

            <h2 className="text-xl font-extrabold text-text-main mb-1">Add Friend</h2>
            <p className="text-sm text-text-muted mb-6">Search by username or email</p>

            {/* Search input */}
            <div className="flex gap-2 mb-6">
              <div className="flex-1 flex items-center gap-2 bg-surface-page rounded-2xl px-4 py-3 border border-secondary/20">
                <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setHasSearched(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="username or email..."
                  className="flex-1 bg-transparent text-sm font-bold text-text-main placeholder:text-text-muted/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              >
                Search
              </button>
            </div>

            {/* Search results */}
            {hasSearched && (
              <div className="flex flex-col gap-3 mb-4">
                {searchResults.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-4">No users found</p>
                ) : (
                  searchResults.map(r => (
                    <div key={r.id} className="flex items-center gap-3 bg-surface-page p-3 rounded-2xl">
                      <img src={r.avatarUrl} alt={r.name} className="w-11 h-11 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-main">{r.name}</p>
                        <p className="text-xs text-text-muted">@{r.username}</p>
                      </div>
                      {sentRequests.has(r.id) || r.status === 'pending_sent' ? (
                        <span className="text-xs font-bold text-text-muted bg-secondary/10 px-3 py-1.5 rounded-full">
                          Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(r.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full font-bold text-xs active:scale-95 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[14px]">person_add</span>
                          Add
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-secondary/15" />
              <span className="text-xs font-bold text-text-muted">or invite via link</span>
              <div className="flex-1 h-px bg-secondary/15" />
            </div>

            {/* Invite link button */}
            <button
              onClick={async () => {
                const text = `Join me on Ezbill to split expenses easily 💸\nhttps://ezbill.app/invite`;
                if (navigator.share) {
                  await navigator.share({ title: 'Join Ezbill', text });
                } else {
                  await navigator.clipboard.writeText(text);
                  alert('Invite link copied!');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary/10 text-primary font-bold active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">link</span>
              Share Invite Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
