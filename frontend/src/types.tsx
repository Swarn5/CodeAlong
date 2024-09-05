type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
};

type Playground = {
  _id: string;
  name: string;
  code: string;
  createdBy: User;
  language: string;
  participatedUsers: User[];
  input: string;
  roomId: string;
  createdAt: string;
  isActive: boolean;
  activeUsers: User[];
};

type Token = {
  token: string;
  refreshToken: string;
};

type Checkpoint = {
  name: string;
  _id: string;
  playgroundId: string;
  code: string;
  createdBy: User;
  createdAt: string;
  language: string;
}

export type { User, Playground, Token , Checkpoint};
