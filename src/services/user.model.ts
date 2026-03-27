// --TYPE DEFINITIONS--

export type InvitationType = 'FRIEND' | 'TRIP';

export const InviteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;
export type InviteStatus = typeof InviteStatus[keyof typeof InviteStatus];

export const FriendStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED',
} as const;
export type FriendStatus = typeof FriendStatus[keyof typeof FriendStatus];

// ----
export class User {
  id: string;
  email!: string;
  displayName!: string;
  createdAt: string;
  avatarUrl?: string;
  friendIds: string[];

  constructor(init: Partial<User>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
    this.friendIds = init.friendIds ?? [];
    this.createdAt = init.createdAt || new Date().toISOString();
  }
  addFriend(userId: string) {
    if (!this.friendIds.includes(userId)) {
      this.friendIds.push(userId);
    }
  }
  removeFriend(userId: string) {
    this.friendIds = this.friendIds.filter((id) => id !== userId);
  }

  isFriend(userId: string): boolean {
    return this.friendIds.includes(userId);
  }
}

export class TripInvite {
  id: string;
  tripId!: string;

  invitedBy!: string;     // userId
  invitedUser?: string;   // userId (nếu mời user có account)
  invitedEmail?: string;  // mời qua email / link

  status: InviteStatus;
  createdAt: string;

  constructor(init: Partial<TripInvite>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
    this.status = init.status || InviteStatus.PENDING;
    this.createdAt = init.createdAt || new Date().toISOString();
  }
}


export class Invitation {
  id: string;
  type: InvitationType | undefined;

  fromUserId!: string;
  toUserId?: string;
  toEmail?: string;         // khi nhập email
  toUsername?: string;      // khi nhập username
  createdAt: string;

  constructor(init: Partial<Invitation>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
    this.createdAt = init.createdAt || new Date().toISOString();
  }
}
