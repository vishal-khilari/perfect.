import { getPost } from '@/lib/drive';
import { PostPageClient } from './PostPageClient';
import { Nav } from '@/components/layout/Nav';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: { fileId: string };
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await getPost(params.fileId);
    return (
      <>
        <Nav />
        <PostPageClient post={post} />
      </>
    );
  } catch {
    notFound();
  }
}
