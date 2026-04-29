export type TeamRole = 'LEADER' | 'MEMBER';
export type UserRole = 'USER' | 'ADMIN';
export type ChatType = 'DM' | 'GROUP';
export type SwipeType = 'LEFT' | 'RIGHT';
export type HackathonMode = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type EligibilityType = 'OPEN' | 'COLLEGE_SPECIFIC';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  image?: string;
  bio?: string;
  college?: string;
  city?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  userId: string;
  skillId: string;
}

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  city?: string;
  mode: HackathonMode;
  eligibilityType: EligibilityType;
  eligibleCollegesList: string[];
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HackathonRegistration {
  id: string;
  userId: string;
  hackathonId: string;
  createdAt: Date;
}

export interface HackathonInterest {
  id: string;
  userId: string;
  hackathonId: string;
  createdAt: Date;
}

export interface Swipe {
  id: string;
  senderId: string;
  receiverId: string;
  hackathonId?: string; // Optional for Explore loop
  type: SwipeType;
  createdAt: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  hackathonId?: string;
  teamId?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name?: string;
  hackathonId: string;
  lookingFor: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
}

export interface Chat {
  id: string;
  type: ChatType;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string; // MATCH, MESSAGE, INVITE
  content: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
}

// Better Auth placeholders for consistency if needed by frontend
export interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
