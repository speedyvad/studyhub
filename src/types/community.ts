// Tipos para Comunidade
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    followers?: number;
  };
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: number;
  shares: number;
  tags: string[];
  images?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  isOwner: boolean;
  tags: string[];
  trendingScore: number;
  avatar?: string;
  coverImage?: string;
  rules: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
  liked: boolean;
}
