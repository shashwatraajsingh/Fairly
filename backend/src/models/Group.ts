import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMember {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface IGroup extends Document {
  _id: string;
  name: string;
  description?: string;
  members: IGroupMember[];
  createdBy: mongoose.Types.ObjectId;
  inviteCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const groupMemberSchema = new Schema<IGroupMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  members: [groupMemberSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate invite code before saving
groupSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  }
  next();
});

export default mongoose.model<IGroup>('Group', groupSchema);
