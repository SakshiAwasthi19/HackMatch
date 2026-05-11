'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import TeamManager from '@/components/dashboard/TeamManager';
import { apiFetch } from '@/lib/auth-client';
import MatchOverlay from '@/components/match/MatchOverlay';
import { Hackathon, AdminTab, SwipeResult } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<TabType>('hackathons');
  const [adminTab, setAdminTab] = useState<AdminTab>('hackathons');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [detailHackathon, setDetailHackathon] = useState<Hackathon | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [preSelectedMatchHackathonId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<SwipeResult | null>(null);
  const [targetChatUserId, setTargetChatUserId] = useState<string | null>(null);
  const [targetChatId, setTargetChatId] = useState<string | null>(null);
  const [swipeRefreshKey, setSwipeRefreshKey] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ title?: string | null } | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle query params for deep linking
    if (!searchParams) return;
    
    const tab = searchParams.get('tab') as TabType | null;
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');

    if (tab) {
      setActiveTab(tab);
      if (chatId) setTargetChatId(chatId);
      if (userId) setTargetChatUserId(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    // Give mobile browsers extra time to hydrate session/cookies
    const timer = setTimeout(() => {
      setIsHydrating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPending && !isHydrating && !session) {
      const hasToken = typeof window !== "undefined" && !!localStorage.getItem('bearer_token');
      
      if (!hasToken) {
        router.push('/login');
      } else {
        console.warn('No session found, but bearer token exists. Mobile cookie issue?');
      }
    }

    if (session) {
      const fetchProfile = async () => {
        try {
          const res = await apiFetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            setCurrentUserProfile(data);
          }
        } catch (e) {
          console.error('Failed to fetch current user profile:', e);
        }
      };
      void fetchProfile();
    }
  }, [session, isPending, isHydrating, router]);

  if (isPending || isHydrating || (!session && typeof window !== "undefined" && !localStorage.getItem('bearer_token'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Fallback user object if session is missing but token exists
  const displayUser = session?.user || { 
    id: 'temp', 
    name: 'User', 
    email: 'user@example.com',
    role: 'USER', 
    image: null as string | null 
  };

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
    if (tab !== 'messages') {
      setTargetChatUserId(null);
      setTargetChatId(null);
    }
    setActiveTab(tab);
    setDetailHackathon(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      <TopNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        user={displayUser} 
        onShowMatch={(data) => setMatchData(data)}
      />
      
      <main className="flex-1 w-full min-h-0 flex flex-col">
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
                onMatch={(data) => setMatchData(data)}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView 
                onMatch={(data) => setMatchData(data)} 
                onStartChat={(userId) => {
                  setTargetChatUserId(userId);
                  setActiveTab('messages');
                }}
              />
            )}

            {activeTab === 'matches' && (
              <MatchesView 
                key={preSelectedMatchHackathonId || 'default'} 
                initialHackathonId={preSelectedMatchHackathonId} 
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === 'teams' && (
              <TeamManager />
            )}

            {activeTab === 'messages' && (
              <MessagesView initialUserId={targetChatUserId} initialChatId={targetChatId} />
            )}

            {activeTab === 'profile' && (
              <ProfileView />
            )}

            {activeTab === 'admin' && (displayUser as { role?: string }).role === 'ADMIN' && (
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
          teamId={matchData.teamId}
          hackathonName={matchData.hackathonName || ''}
          currentUserImage={displayUser?.image}
          currentUserTitle={currentUserProfile?.title}
          matchType={matchData.matchType}
          relatedId={matchData.relatedId}
          onClose={() => setMatchData(null)} 
          onAction={({ chatId }) => {
            setMatchData(null);
            if (chatId) setTargetChatId(chatId);
            setActiveTab('messages');
          }}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
