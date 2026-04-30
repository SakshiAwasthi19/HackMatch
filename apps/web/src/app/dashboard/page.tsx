'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import TopNavbar, { TabType } from '@/components/dashboard/TopNavbar';
import HackathonList from '@/components/dashboard/HackathonList';
import ExploreView from '@/components/dashboard/ExploreView';
import SwipeView from '@/components/dashboard/SwipeView';
import MatchesView from '@/components/dashboard/MatchesView';
import MessagesView from '@/components/dashboard/MessagesView';
import ProfileView from '@/components/dashboard/ProfileView';
import AdminView from '@/components/dashboard/AdminView';
import HackathonDetailView from '@/components/dashboard/HackathonDetailView';
import { apiFetch } from '@/lib/auth-client';
import MatchOverlay from '@/components/match/MatchOverlay';
import { Hackathon, Match } from '@/lib/types';
import { AdminTab } from '@/components/dashboard/AdminView';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<TabType>('hackathons');
  const [adminTab, setAdminTab] = useState<AdminTab>('hackathons');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [detailHackathon, setDetailHackathon] = useState<Hackathon | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [preSelectedMatchHackathonId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<unknown>(null);
  const [swipeRefreshKey, setSwipeRefreshKey] = useState(0);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Handle switching from Hackathons list to Detail view
  const handleSelectHackathon = async (hackathonId: string) => {
    setLoadingDetail(true);
    try {
      const response = await apiFetch(`/api/hackathons/${hackathonId}`);
      const data = await response.json();
      if (data && data.id) {
        setDetailHackathon(data);
        setSelectedHackathonId(hackathonId);
      } else {
        console.error('Invalid hackathon data received:', data);
      }
    } catch (err) {
      console.error('Failed to fetch hackathon details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setDetailHackathon(null);
  };

  const handleCreateClick = () => {
    setAdminTab('dashboard');
    setActiveTab('admin');
    setDetailHackathon(null);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'admin') setAdminTab('dashboard');
    if (tab === 'swipe') setSwipeRefreshKey(prev => prev + 1);
    setActiveTab(tab);
    setDetailHackathon(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      <TopNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        user={session.user} 
        onShowMatch={(data) => setMatchData(data)}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {loadingDetail && (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}

        {!loadingDetail && detailHackathon && (
          <HackathonDetailView 
            hackathon={detailHackathon} 
            onBack={handleBackToList}
            onFindTeam={(id) => {
              setSelectedHackathonId(id);
              setDetailHackathon(null);
              setActiveTab('swipe');
            }}
            onToggleInterest={async () => {
              try {
                const res = await apiFetch(`/api/hackathons/${detailHackathon.id}/interest`, { method: 'POST' });
                if (res.ok) {
                  setDetailHackathon({ ...detailHackathon, isInterested: !detailHackathon.isInterested });
                }
              } catch (e) { console.error(e); }
            }}
          />
        )}

        {!loadingDetail && !detailHackathon && (
          <>
            {activeTab === 'hackathons' && (
              <HackathonList 
                onSelectHackathon={handleSelectHackathon} 
                onCreateClick={handleCreateClick}
              />
            )}
            
            {activeTab === 'swipe' && (
              <SwipeView 
                key={`swipe-${swipeRefreshKey}`}
                selectedHackathonId={selectedHackathonId} 
                user={session.user}
                onRequestHackathonSelection={() => setActiveTab('hackathons')}
                onMatch={(data) => setMatchData(data)}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView />
            )}

            {activeTab === 'matches' && (
              <MatchesView key={preSelectedMatchHackathonId || 'default'} initialHackathonId={preSelectedMatchHackathonId} />
            )}

            {activeTab === 'messages' && (
              <MessagesView />
            )}

            {activeTab === 'profile' && (
              <ProfileView />
            )}

            {activeTab === 'admin' && (session.user as { role?: string }).role === 'ADMIN' && (
              <AdminView initialTab={adminTab} />
            )}
          </>
        )}
      </main>
      {matchData && (
        <MatchOverlay 
          isOpen={!!matchData}
          matchedUser={matchData.matchedUser}
          chatId={matchData.chatId}
          hackathonName={matchData.hackathonName}
          currentUserImage={session.user?.image}
          onClose={() => setMatchData(null)} 
        />
      )}
    </div>
  );
}
