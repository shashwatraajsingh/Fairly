import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  authProvider: 'email' | 'google' | 'phone';
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 6
  },
  avatar: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'phone'],
    default: 'email'
  },
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.firebaseUid;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);
