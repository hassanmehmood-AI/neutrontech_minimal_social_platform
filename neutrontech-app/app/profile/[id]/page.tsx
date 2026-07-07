'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  role: string | null;
  followers: number;
  following: number;
};

type Post = {
  id: number;
  author: string;
  avatar: string;
  time: string;
  tag: string;
  content: string;
  images: string[];
  videoUrl?: string;
  likes: number;
  comments: number;
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile]         = useState<Profile | null>(null);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<'posts' | 'media'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const mediaPosts = posts.filter((p) => p.images.length > 0 || p.videoUrl);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }

      // If this is the current user's own profile, redirect to /profile
      if (session.user.id === userId) { router.replace('/profile'); return; }

      const [profileRes, followRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/follow`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }),
      ]);

      if (profileRes.ok) {
        const { user, posts: userPosts } = await profileRes.json();
        setProfile(user);
        setPosts(userPosts);
      }
      if (followRes.ok) {
        const { following } = await followRes.json();
        setIsFollowing(following);
      }
      setLoading(false);
    });
  }, [router, userId]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setProfile((prev) => prev ? { ...prev, followers: Math.max(0, prev.followers + (wasFollowing ? -1 : 1)) } : prev);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const { following, followers } = await res.json();
        setIsFollowing(following);
        setProfile((prev) => prev ? { ...prev, followers } : prev);
      } else {
        setIsFollowing(wasFollowing);
        setProfile((prev) => prev ? { ...prev, followers: Math.max(0, prev.followers + (wasFollowing ? 1 : -1)) } : prev);
      }
    } catch {
      setIsFollowing(wasFollowing);
      setProfile((prev) => prev ? { ...prev, followers: Math.max(0, prev.followers + (wasFollowing ? 1 : -1)) } : prev);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px]">person_off</span>
        <p className="font-label-md text-label-md">User not found.</p>
        <Link href="/search" className="text-primary font-label-md text-label-md hover:underline">Back to Search</Link>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'User';
  const avatarUrl   = profile.avatar_url || undefined;
  const bio         = profile.bio || '';

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop shadow-sm">
        <div className="grid grid-cols-3 items-center w-full max-w-[1280px] mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden lg:inline font-label-md text-label-md">Back</span>
          </button>
          <div className="flex justify-center">
            <span className="font-label-md text-label-md font-bold text-on-surface truncate">{displayName}</span>
          </div>
          <div />
        </div>
      </header>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">
        <div className="h-16 flex items-center mb-sm">
            <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col space-y-xs pt-md">
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/search">
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
        </nav>
      </aside>

      <main className="lg:ml-64 pt-16 min-h-screen pb-24 lg:pb-8">

        {/* ── COVER PHOTO ── */}
        <div className="relative h-40 md:h-64 lg:h-72 w-full overflow-hidden">
          {profile.cover_url ? (
            <img className="w-full h-full object-cover" src={profile.cover_url} alt="Cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-primary-container" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
            </>
          )}
        </div>

        {/* ── MOBILE PROFILE HEADER ── */}
        <div className="px-margin-mobile -mt-12 relative z-10 lg:hidden">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-surface overflow-hidden shadow-lg bg-surface-container flex items-center justify-center">
              {avatarUrl
                ? <img className="w-full h-full object-cover" src={avatarUrl} alt={displayName} />
                : <span className="material-symbols-outlined text-primary text-[48px]">person</span>
              }
            </div>
            <div className="text-center mt-md">
              <h2 className="font-headline-md text-on-surface">{displayName}</h2>
            </div>
            {bio && <p className="text-center font-body-md text-on-surface-variant mt-sm leading-relaxed">{bio}</p>}
            {profile.role && (
              <div className="flex items-center gap-xs mt-sm text-primary">
                <span className="material-symbols-outlined text-[18px]">work</span>
                <span className="font-label-md text-label-md">{profile.role}</span>
              </div>
            )}
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`mt-md w-full max-w-[24rem] h-12 rounded-xl font-label-md text-label-md active:scale-95 transition-transform disabled:opacity-60 ${isFollowing ? 'bg-surface border border-outline-variant text-on-surface' : 'bg-primary text-on-primary'}`}
            >
              {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>

        {/* ── DESKTOP PROFILE CARD ── */}
        <div className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop -mt-16 md:-mt-24 relative z-10 pb-xl hidden lg:block">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg md:p-xl border border-outline-variant">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-md">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-surface border-4 border-surface-container-lowest shadow-sm overflow-hidden flex items-center justify-center">
                  {avatarUrl
                    ? <img className="w-full h-full object-cover" src={avatarUrl} alt={displayName} />
                    : <span className="material-symbols-outlined text-primary text-[64px]">person</span>
                  }
                </div>
                <div className="mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{displayName}</h1>
                  {profile.role && (
                    <div className="flex items-center mt-2 gap-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      <span className="font-label-sm text-label-sm">{profile.role}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-xl py-sm rounded-xl font-label-md text-label-md active:scale-95 transition-transform disabled:opacity-60 ${isFollowing ? 'border border-outline-variant text-on-surface bg-surface' : 'bg-primary text-on-primary border-0'}`}
              >
                {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
            {bio && (
              <div className="mt-lg max-w-2xl">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{bio}</p>
              </div>
            )}
            <div className="flex gap-lg mt-md">
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{posts.length}</p>
                <p className="font-label-sm text-on-surface-variant">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{profile.followers ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{profile.following ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── POSTS SECTION ── */}
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-xl mt-xl lg:mt-0">

          {/* About sidebar (desktop) */}
          <div className="lg:col-span-4 space-y-gutter hidden lg:block">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">About</h3>
              <ul className="space-y-md">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">article</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{posts.length}</span> posts</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{profile.followers ?? 0}</span> followers</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  <div className="font-body-md text-body-md text-on-surface-variant">Following <span className="font-bold text-on-surface">{profile.following ?? 0}</span></div>
                </li>
              </ul>
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="flex items-center border-b border-outline-variant pb-0">
              <div className="flex space-x-lg">
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('posts')}
                >Posts</button>
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('media')}
                >Media</button>
              </div>
            </div>

            {/* ── POSTS TAB ── */}
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] block mb-md">article</span>
                    <p className="font-label-md text-label-md">No posts yet.</p>
                  </div>
                )}
                {posts.map((post) => (
                  <div key={post.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                    <div className="flex items-center gap-sm mb-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden flex items-center justify-center shrink-0">
                        {post.avatar
                          ? <img className="w-full h-full object-cover" src={post.avatar} alt={post.author} />
                          : <span className="material-symbols-outlined text-primary">person</span>
                        }
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{post.author}</p>
                        <p className="text-label-sm text-on-surface-variant">{post.time}{post.tag ? ` • ${post.tag}` : ''}</p>
                      </div>
                    </div>

                    {post.content && (
                      <p className="text-body-md text-on-surface mb-md">{post.content}</p>
                    )}

                    {post.images.length > 0 && (
                      <div className={`${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-xs'} mb-md`}>
                        {post.images.map((src, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-outline-variant aspect-video">
                            <img className="w-full h-full object-cover" src={src} alt={`Image ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {post.videoUrl && (
                      <div className="rounded-xl overflow-hidden mb-md border border-outline-variant">
                        <video src={post.videoUrl} controls className="w-full max-h-64 object-contain bg-black" />
                      </div>
                    )}

                    <div className="flex items-center gap-md border-t border-outline-variant pt-sm">
                      <span className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                        <span className="text-label-md">{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                        <span className="text-label-md">{post.comments}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── MEDIA TAB ── */}
            {activeTab === 'media' && (
              <>
                {mediaPosts.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] block mb-md">photo_library</span>
                    <p className="font-label-md text-label-md">No media yet.</p>
                  </div>
                )}
                {mediaPosts.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {mediaPosts.flatMap((post) => [
                      ...post.images.map((src, i) => (
                        <div key={`${post.id}-img-${i}`} className="aspect-square overflow-hidden rounded-sm bg-surface-container-low">
                          <img className="w-full h-full object-cover" src={src} alt="" />
                        </div>
                      )),
                      ...(post.videoUrl ? [
                        <div key={`${post.id}-vid`} className="aspect-square overflow-hidden rounded-sm bg-black relative">
                          <video className="w-full h-full object-cover" src={post.videoUrl} muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                          </div>
                        </div>
                      ] : []),
                    ])}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant h-16 lg:hidden">
        <div className="flex justify-around items-center h-full">
          <Link href="/feed" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">home</span>
            <span className="text-label-sm font-label-sm">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-primary font-bold active:scale-95">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="text-label-sm font-label-sm">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">person</span>
            <span className="text-label-sm font-label-sm">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
