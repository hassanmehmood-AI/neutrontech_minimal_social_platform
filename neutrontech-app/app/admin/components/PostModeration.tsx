'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type AdminPost = {
  id: number;
  title: string;
  author: string;
  status: 'pending' | 'published';
  time: string;
};

export default function PostModeration({ showMoreHref }: { showMoreHref?: string }) {
  const { accessToken } = useAdminContext();
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    fetch('/api/admin/posts', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => res.json())
      .then(setPosts);
  };

  useEffect(load, [accessToken]);

  const setStatus = async (post: AdminPost, status: 'pending' | 'published') => {
    setBusyId(post.id);
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
    setBusyId(null);
  };

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-lg">Post Moderation</h3>
      <div className="space-y-md">
        {!posts && <p className="font-body-sm text-body-sm text-secondary">Loading…</p>}
        {posts?.length === 0 && (
          <p className="font-body-sm text-body-sm text-secondary">No posts yet.</p>
        )}
        {(showMoreHref ? posts?.slice(0, 5) : posts)?.map((post) => (
          <div
            key={post.id}
            className="group p-md rounded-lg hover:bg-surface-container-low border border-transparent hover:border-surface-variant/30 transition-all"
          >
            <div className="flex justify-between items-start mb-xs">
              <p className="font-body-sm text-body-sm font-bold text-on-surface truncate pr-4">
                {post.title || '(no content)'}
              </p>
              <span
                className={
                  post.status === 'pending'
                    ? 'text-[10px] uppercase tracking-wider font-bold text-secondary-container bg-secondary-fixed-dim px-2 py-0.5 rounded'
                    : 'text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded'
                }
              >
                {post.status === 'pending' ? 'Pending' : 'Published'}
              </span>
            </div>
            <p className="text-[12px] text-secondary mb-md">
              By <span className="text-on-surface font-medium">{post.author}</span> • {post.time}
            </p>
            <div className="flex gap-xs">
              {post.status === 'pending' ? (
                <button
                  disabled={busyId === post.id}
                  onClick={() => setStatus(post, 'published')}
                  className="flex-1 py-1.5 rounded-md bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Approve
                </button>
              ) : (
                <button
                  disabled={busyId === post.id}
                  onClick={() => setStatus(post, 'pending')}
                  className="flex-1 py-1.5 rounded-md border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high disabled:opacity-50"
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className="block text-center mt-auto pt-md border-t border-surface-variant/50 font-label-md text-label-md text-primary hover:underline"
        >
          Show more
        </Link>
      )}
    </div>
  );
}
