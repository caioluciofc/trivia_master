import { UserModel, type User } from '../models';

export class UserProvider {
  static create(username: string, password: string) {
    const newUser = new UserModel({
      _id: username,
      password,
    });
    newUser.save();
  }

  static async getUser(username: string): Promise<User | null> {
    const user = await UserModel.findById(username);
    return user;
  }

  static async updatePassword(username: string, newPassword: string) {
    await UserModel.findByIdAndUpdate(username, { password: newPassword });
  }

  static async addWin(username: string) {
    const user = await this.getUser(username);
    if (user) {
      await UserModel.findByIdAndUpdate(username, { wins: user.wins + 1 });
    }
  }

  static async delete(username: string, password: string) {
    const user = await this.getUser(username);
    if (user?.password !== password) {
      return 'The correct password is needed to delete the user';
    } else {
      const result = await UserModel.findByIdAndDelete(username);
      return result;
    }
  }

  static async getRanking() {
    const query = UserModel.find().select('_id wins').sort('-wins').limit(10);
    return await query.exec();
  }
}
