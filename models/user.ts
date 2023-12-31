import * as mongoose from 'mongoose';
import * as bcryptjs from 'bcryptjs';

export interface User extends mongoose.Document {
  _id: string;
  password: string;
  wins: number;
}

const userSchema = new mongoose.Schema({
  _id: String,
  password: String,
  wins: { type: Number, default: 0 },
});

// Before saving the user, hash the password
userSchema.pre('save', async function (next) {
  const user = this as User;
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 10);
  }
  next();
});

export const UserModel = mongoose.model<User>('User', userSchema);
