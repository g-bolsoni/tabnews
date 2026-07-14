export interface IUser {
  id: string;
  username: string;
  email: string;
  features: string[];
  password: string;
  created_at: Date;
  updated_at: Date;
}
