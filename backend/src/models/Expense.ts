import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseSplit {
  user: mongoose.Types.ObjectId;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface IExpense extends Document {
  _id: string;
  group: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: mongoose.Types.ObjectId;
  splitBetween: IExpenseSplit[];
  receipt?: string;
  date: Date;
  isSettled: boolean;
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSplitSchema = new Schema<IExpenseSplit>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
});

const expenseSchema = new Schema<IExpense>({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'entertainment', 'accommodation', 'utilities', 'shopping', 'other'],
    default: 'other'
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitBetween: [expenseSplitSchema],
  receipt: {
    type: String // URL to receipt image
  },
  date: {
    type: Date,
    default: Date.now
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  settledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'splitBetween.user': 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);
