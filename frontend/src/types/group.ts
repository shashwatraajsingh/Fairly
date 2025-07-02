export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  joinedAt: Date;
  role: 'admin' | 'member';
}

export interface GroupInvite {
  groupId: string;
  email: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
}
