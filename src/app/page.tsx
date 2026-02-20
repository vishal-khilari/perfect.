import { Suspense } from 'react';
import { getPublicPosts } from '@/lib/drive';
import { LandingClient } from './LandingClient';

// Fetch 5 random posts server-side
async function getRandomPosts() {
  try {
    const posts = await getPublicPosts({ limit: 5, orderBy: 'random' });
    return posts;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getRandomPosts();

  return <LandingClient initialPosts={posts} />;
}
