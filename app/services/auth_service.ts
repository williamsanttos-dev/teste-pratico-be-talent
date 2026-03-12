import User from '#models/user'
import type { SignupData } from '#validators/user'

export default class AuthService {
  static async signup(data: SignupData) {
    return await User.create(data)
  }
}
