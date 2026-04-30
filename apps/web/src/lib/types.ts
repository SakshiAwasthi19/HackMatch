export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  title?: string;
  bio?: string;
  college?: string;
  city?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  role?: 'USER' | 'ADMIN';
  lastActiveAt?: string;
  updatedAt: string;
  createdAt: string;
  skills?: UserSkill[];
}

export interface UserSkill {
  skill: {
    id: string;
    name: string;
  };
}

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  mode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  eligibilityType: 'OPEN' | 'COLLEGE_SPECIFIC';
  eligibleCollegesList?: string[];
  websiteUrl: string;
  imageUrl: string;
  tags: string[];
  isInterested?: boolean;
}

export interface HostRequest {
  id: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  content?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    name: string;
    image: string | null;
  };
  relatedId?: string;
  metadata?: Record<string, unknown>;
}

export interface Match {
  id: string;
  hackathonId: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  hackathon: {
    name: string;
  };
  otherUser: User;
}

export type AdminTab = 'dashboard' | 'hackathons' | 'users' | 'moderation' | 'analytics' | 'create';

export interface SwipeResult {
  matched: boolean;
  teamId?: string | null;
  chatId?: string;
  hackathonName?: string;
  matchedUser?: { id: string; name: string; image: string | null };
}

export interface SwipeDeckUser {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  title: string | null;
  college: string | null;
  city: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  skills: { skill: { id: string; name: string } }[];
}
