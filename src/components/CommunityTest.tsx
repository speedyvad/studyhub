import React from 'react';
import type { Post, Group } from '../types/community';

export default function CommunityTest() {
  // Teste simples para verificar se os tipos estão funcionando
  const testPost: Post = {
    id: '1',
    content: 'Teste',
    author: {
      id: '1',
      name: 'Teste'
    },
    timestamp: new Date().toISOString(),
    likes: 0,
    liked: false,
    comments: 0,
    shares: 0,
    tags: []
  };

  const testGroup: Group = {
    id: '1',
    name: 'Teste',
    description: 'Teste',
    category: 'Teste',
    memberCount: 0,
    postCount: 0,
    isPrivate: false,
    isJoined: false,
    isOwner: false,
    tags: [],
    trendingScore: 0,
    rules: [],
    createdAt: new Date().toISOString()
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Tipos da Comunidade</h2>
      <div className="space-y-2">
        <p><strong>Post:</strong> {testPost.content}</p>
        <p><strong>Group:</strong> {testGroup.name}</p>
        <p className="text-green-600">✅ Tipos funcionando corretamente!</p>
      </div>
    </div>
  );
}
