'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts]     = useState<Post[]>([]);
  const [liked, setLiked]     = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab]   = useState<'posts' | 'media'>('posts');
  const [scrolled, setScrolled]     = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }

      const res = await fetch(`/api/users/${session.user.id}`);
      if (res.ok) {
        const { user, posts: userPosts } = await res.json();
        setProfile(user);
        setPosts(userPosts);
      }
      setAuthLoading(false);
    });
  }, [router]);

  const toggleLike = (id: number) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const displayName = profile?.full_name || profile?.username || 'Your Profile';
  const username    = profile?.username || '';
  const bio         = profile?.bio || 'No bio yet.';
  const avatarUrl   = profile?.avatar_url || undefined;

  const mediaPosts  = posts.filter((p) => p.images.length > 0 || p.videoUrl);
  const visiblePosts = activeTab === 'posts' ? posts : mediaPosts;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <header className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="flex justify-between items-center w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-xs">
            <Link href="/"><img src="/logo.png" alt="NeutronTech" className="h-12 w-auto drop-shadow-sm" /></Link>
          </div>
          <nav className="hidden lg:flex items-center space-x-lg">
            <Link href="/feed" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Feed</Link>
            <Link href="/search" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Search</Link>
          </nav>
          <div className="flex items-center gap-sm">
            <button className="lg:hidden material-symbols-outlined p-xs hover:bg-surface-container-high rounded-full transition-colors text-secondary" onClick={() => window.location.href = '/search'}>search</button>
            <button onClick={handleLogout} className="hidden lg:block font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low px-md py-xs rounded-lg transition-all active:scale-95">Logout</button>
          </div>
        </div>
      </header>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant pt-20 p-md space-y-sm">
        <div className="flex flex-col space-y-xs pb-md border-b border-outline-variant">
          <div className="flex items-center space-x-sm px-xs">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
              {avatarUrl
                ? <img alt="User" className="w-full h-full object-cover" src={avatarUrl} />
                : <span className="material-symbols-outlined text-primary">person</span>
              }
            </div>
            <div>
              <p className="font-label-md text-label-md text-primary font-bold">{displayName}</p>
              {username && <p className="font-label-sm text-label-sm text-on-surface-variant">@{username}</p>}
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col space-y-xs pt-md">
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm bg-secondary-container text-on-secondary-container rounded-xl font-bold" href="/profile">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/search">
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
        </nav>
        <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
          <button onClick={handleLogout} className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-16 min-h-screen pb-24 lg:pb-8">

        {/* ── PROFILE BANNER ── */}
        <div className="relative h-40 md:h-64 lg:h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-primary-container"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '24px 24px' }}></div>
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
              <h2 className="font-headline-md text-headline-lg-mobile text-on-surface">{displayName}</h2>
              {username && <p className="font-label-md text-label-md text-on-surface-variant">@{username}</p>}
            </div>
            <div className="flex gap-sm w-full max-w-[24rem] mt-md">
              <button className="flex-1 bg-surface border border-outline-variant text-on-surface h-12 rounded-xl font-label-md text-label-md active:scale-95 transition-transform duration-150">
                Edit Profile
              </button>
            </div>
            <div className="w-full mt-lg">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{bio}</p>
              {profile?.role && (
                <div className="flex items-center gap-xs mt-sm text-primary">
                  <span className="material-symbols-outlined text-[18px]">work</span>
                  <span className="font-label-md text-label-md">{profile.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DESKTOP PROFILE CARD ── */}
        <div className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop -mt-16 md:-mt-24 relative z-10 pb-xl hidden lg:block">
          <div className="bg-surface-container-lowest rounded-xl tonal-layer soft-shadow p-lg md:p-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-md">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-surface border-4 border-surface-container-lowest soft-shadow overflow-hidden flex items-center justify-center">
                    {avatarUrl
                      ? <img className="w-full h-full object-cover" src={avatarUrl} alt={displayName} />
                      : <span className="material-symbols-outlined text-primary text-[64px]">person</span>
                    }
                  </div>
                </div>
                <div className="mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{displayName}</h1>
                  {username && <p className="font-label-md text-label-md text-secondary">@{username}</p>}
                  {profile?.role && (
                    <div className="flex items-center mt-2 space-x-base text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      <span className="font-label-sm text-label-sm">{profile.role}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button className="border border-outline-variant px-lg py-sm rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-all active:scale-95">Edit Profile</button>
              </div>
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
                <p className="font-headline-md text-on-surface">{profile?.followers ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{profile?.following ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── POSTS SECTION ── */}
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-xl mt-xl lg:mt-0">

          {/* About sidebar (desktop) */}
          <div className="lg:col-span-4 space-y-gutter hidden lg:block">
            <div className="bg-surface-container-lowest rounded-xl tonal-layer soft-shadow p-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Stats</h3>
              <ul className="space-y-md">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">article</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{posts.length}</span> posts</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{profile?.followers ?? 0}</span> followers</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  <div className="font-body-md text-body-md text-on-surface-variant">Following <span className="font-bold text-on-surface">{profile?.following ?? 0}</span></div>
                </li>
              </ul>
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="flex items-center justify-between border-b border-outline-variant pb-0">
              <div className="flex space-x-lg">
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('posts')}
                >Recent Posts</button>
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('media')}
                >Media</button>
              </div>
            </div>

            {visiblePosts.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] block mb-md">article</span>
                <p className="font-label-md text-label-md">No posts yet. Share something on the feed!</p>
              </div>
            )}

            {visiblePosts.map((post) => (
              <div key={post.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-sm">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden flex items-center justify-center">
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
                  <button className="material-symbols-outlined text-on-surface-variant">more_horiz</button>
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

                <div className="flex items-center gap-md border-t border-outline-variant pt-sm">
                  <button className={`flex items-center gap-xs transition-colors ${liked[post.id] ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => toggleLike(post.id)}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked[post.id] ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    <span className="text-label-md">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="text-label-md">{post.comments}</span>
                  </button>
                  <button className="ml-auto flex items-center gap-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── DESKTOP FOOTER ── */}
      <footer className="w-full py-xl bg-surface-container-lowest border-t border-outline-variant hidden lg:block">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto gap-md lg:ml-64">
          <div className="flex items-center space-x-sm">
            <img src="/logo.png" alt="NeutronTech" className="h-12 w-auto drop-shadow-sm" />
            <span className="font-label-sm text-label-sm text-secondary">© 2024 NeutronTech Inc.</span>
          </div>
          <div className="flex space-x-lg">
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">About</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">Terms</a>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant h-16 lg:hidden">
        <div className="flex justify-around items-center h-full">
          <Link href="/feed" className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">home</span>
            <span className="text-label-sm font-label-sm">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">search</span>
            <span className="text-label-sm font-label-sm">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-primary font-bold transition-all active:scale-95">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-label-sm font-label-sm">Profile</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-sm font-label-sm">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
