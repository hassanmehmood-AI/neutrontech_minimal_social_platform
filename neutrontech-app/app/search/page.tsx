'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Person = { id: number; name: string; role: string; avatar: string; };
type Post   = { id: number; title: string; content: string; tag: string; likes: number; comments: number; time: string; imageUrl?: string; };
type Topic  = { id: number; name: string; category: string; posts: string; };
type Event  = { id: number; title: string; organizer: string; date: string; imageUrl?: string; };

const FILTERS   = ['All', 'People', 'Posts', 'Topics', 'Events'];
const SUGGESTED = ['Quantum Computing', 'AI Ethical Frameworks', 'Web3 Scalability', 'Rust Development', 'UI Design Systems'];

const EVENTS: Event[] = [
  { id: 1, title: 'The Future of Silicon: Keynotes from the 2024 Summit', organizer: 'NeutronTech Events',      date: 'Dec 15, 2024', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu4hoySxNStg7t6v0omPnnQSIzL72KmlQ55xGEKI06lha_E1eT4DQT7D3l1Cu_t3gA7grZh_uNBQrzOE9UfdT6HAzJe9H-YPd2WYmJIPgU16XR7TRUmPnl5A7kK9xwQlWznYKWb3CQa4HPWbdUJgP7wFrWWj8YoA4AM1pjyJDTCzTYKbNKTq_ciwNGNZjYdeVanXi9FaBFrjl2wft1jVgiF-g5DGFSkx-BtC6bZ9MKpBLziWFrwE7AYGv-MtDwsbANTr8NdA2hyAc' },
  { id: 2, title: 'Web3 Developer Conference 2025',                         organizer: 'Blockchain Alliance',    date: 'Jan 8, 2025'  },
  { id: 3, title: 'AI Ethics & Governance Workshop',                        organizer: 'Tech Policy Institute',  date: 'Dec 22, 2024' },
];

function fmtNum(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ people: Person[]; posts: Post[]; topics: Topic[] }>({
    people: [],
    posts: [],
    topics: [],
  });

  useEffect(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    fetch(`/api/search${params}`)
      .then((r) => r.json())
      .then(setResults);
  }, [query]);

  const filteredEvents = EVENTS.filter(
    (e) => !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.organizer.toLowerCase().includes(query.toLowerCase())
  );

  const show = {
    people: activeFilter === 'All' || activeFilter === 'People',
    posts:  activeFilter === 'All' || activeFilter === 'Posts',
    topics: activeFilter === 'All' || activeFilter === 'Topics',
    events: activeFilter === 'All' || activeFilter === 'Events',
  };

  const hasResults =
    (show.people && results.people.length > 0) ||
    (show.posts  && results.posts.length  > 0) ||
    (show.topics && results.topics.length > 0) ||
    (show.events && filteredEvents.length > 0);

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant h-16">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-full w-full max-w-[1280px] mx-auto">
          <Link href="/" className="font-display text-headline-lg-mobile lg:text-headline-lg text-primary tracking-tight">NeutronTech</Link>
          <nav className="hidden lg:flex items-center space-x-lg">
            <Link href="/feed"   className="text-secondary font-label-md text-label-md hover:text-primary transition-colors">Feed</Link>
            <Link href="/search" className="text-primary font-bold border-b-2 border-primary font-label-md text-label-md">Search</Link>
          </nav>
          <div className="flex items-center gap-xs">
            <button className="lg:hidden p-xs active:scale-95 duration-150">
              <span className="material-symbols-outlined text-secondary">notifications</span>
            </button>
            <Link href="/login"   className="hidden lg:block bg-primary-container text-on-primary px-lg py-xs rounded-full font-label-md text-label-md active:scale-95 duration-150">Sign Up</Link>
            <Link href="/profile" className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden block shrink-0">
              <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcqt_iehTSV02PzMhwYKP6C8oudwBKdBpxZCAelVYeDZInkW20rymQc_fV1DwoXru5w_zH2ZXc0qPir_jy0Fq5zBlnp0LDXL7ZIkhrDyZEHJ5mfNCWuxu9jj5v7HT5-iWUrnPx6WyZ4VFyA19063lTfpa0p33pvlt8UQxnzbHT4c80PAVx7yd52NrmYw2baAVJf5XQsKgiYOSr1Epb3XoIwWLoDbcjRXAIxcmllRowVsR7CEbaU7fJFdi2pMcqE-WCYIPDbDrY9Po" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md space-y-sm z-40">
        <div className="pt-xl pb-lg">
          <Link href="/" className="font-display text-headline-md text-primary">NeutronTech</Link>
          <p className="font-label-md text-label-md text-on-surface-variant">Tech-Social Hub</p>
        </div>
        <nav className="flex-grow space-y-xs">
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-xl font-bold" href="/search">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
        </nav>
        <div className="border-t border-outline-variant pt-md space-y-xs">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-20 pb-28 md:pb-xl min-h-screen">
        <div className="px-margin-mobile md:px-margin-desktop space-y-lg">

          {/* Sticky search + filters */}
          <div className="sticky top-16 bg-surface z-40 py-md -mx-margin-mobile px-margin-mobile md:-mx-margin-desktop md:px-margin-desktop">
            <div className="relative max-w-[900px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-12 pr-4 md:pr-28 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-body-md text-on-surface shadow-sm"
                placeholder="Search NeutronTech..."
                type="text"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-[7rem] md:right-28 top-1/2 -translate-y-1/2 text-outline hover:text-primary mr-2 md:mr-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
              <button className="hidden md:block absolute right-md top-1/2 -translate-y-1/2 bg-primary-container text-on-primary px-lg py-xs rounded-xl font-label-md text-label-md active:scale-95">
                Search
              </button>
            </div>

            {/* Filter chips */}
            <div className="mt-md flex gap-xs overflow-x-auto no-scrollbar -mx-margin-mobile px-margin-mobile md:-mx-margin-desktop md:px-margin-desktop">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 px-md py-xs rounded-full font-label-md text-label-md whitespace-nowrap active:scale-95 duration-150 transition-all ${
                    activeFilter === filter
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container-low text-secondary border border-outline-variant'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested chips — visible when query is empty */}
          {!query && (
            <section>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Suggested for you</h2>
              <div className="flex flex-wrap gap-xs">
                {SUGGESTED.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="flex items-center gap-xs px-md py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors group"
                  >
                    <span className="material-symbols-outlined text-sm text-secondary group-hover:text-primary">trending_up</span>
                    <span className="font-label-md text-label-md">{tag}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Results grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

            {/* Main results */}
            <div className="lg:col-span-8 space-y-lg">

              {/* Section header */}
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {query ? `Results for "${query}"` : 'Top Results'}
                </h2>
                {query && (
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {results.people.length + results.posts.length + results.topics.length + filteredEvents.length} found
                  </span>
                )}
              </div>

              {/* No results state */}
              {query && !hasResults && (
                <div className="flex flex-col items-center justify-center py-16 gap-md text-center">
                  <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
                  <p className="font-headline-md text-on-surface">No results for &ldquo;{query}&rdquo;</p>
                  <p className="font-body-md text-on-surface-variant">Try different keywords or check the spelling.</p>
                </div>
              )}

              {/* ── PEOPLE ── */}
              {show.people && results.people.length > 0 && (
                <section className="space-y-md">
                  {activeFilter === 'All' && (
                    <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant tracking-widest">People</h3>
                  )}
                  {results.people.map((person) => (
                    <Link key={person.id} href="/profile" className="flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-md transition-all active:scale-[0.98] shadow-sm">
                      <img alt={person.name} className="w-14 h-14 rounded-full object-cover shrink-0" src={person.avatar} />
                      <div className="flex-1 min-w-0">
                        <p className="font-headline-md text-[18px] text-on-surface leading-tight">{person.name}</p>
                        <p className="text-on-surface-variant font-label-md text-label-md truncate">{person.role}</p>
                      </div>
                      <button
                        className="shrink-0 border border-primary-container text-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm hover:bg-primary-container hover:text-white transition-all"
                        onClick={(e) => e.preventDefault()}
                      >Follow</button>
                    </Link>
                  ))}
                </section>
              )}

              {/* ── POSTS ── */}
              {show.posts && results.posts.length > 0 && (
                <section className="space-y-md">
                  {activeFilter === 'All' && (
                    <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant tracking-widest">Posts</h3>
                  )}
                  {results.posts.map((post) => (
                    <div key={post.id} className="p-md bg-surface-container-lowest border border-outline-variant rounded-xl transition-all shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-xs mb-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-primary">article</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                          In Topics • {post.tag}
                        </span>
                      </div>
                      <h3 className="font-headline-md text-[20px] text-on-surface mb-sm leading-snug">{post.title}</h3>
                      {post.imageUrl && (
                        <img alt={post.title} className="w-full h-40 object-cover rounded-lg mb-sm" src={post.imageUrl} />
                      )}
                      <p className="text-on-surface-variant line-clamp-2 mb-md font-body-md text-body-md">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-md">
                          <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-sm">favorite</span> {fmtNum(post.likes)}
                          </span>
                          <span className="flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-sm">mode_comment</span> {post.comments}
                          </span>
                        </div>
                        <span className="text-outline font-label-sm text-label-sm">{post.time}</span>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* ── TOPICS ── */}
              {show.topics && results.topics.length > 0 && (
                <section className="space-y-md">
                  {activeFilter === 'All' && (
                    <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant tracking-widest">Topics</h3>
                  )}
                  <div className="space-y-xs">
                    {results.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setQuery(topic.name.replace('#', ''))}
                        className="w-full flex justify-between items-center p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <p className="text-on-surface-variant font-label-sm text-label-sm uppercase">{topic.category}</p>
                          <p className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">{topic.name}</p>
                        </div>
                        <span className="font-label-sm text-label-sm text-outline shrink-0">{topic.posts} posts</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ── EVENTS ── */}
              {show.events && filteredEvents.length > 0 && (
                <section className="space-y-md">
                  {activeFilter === 'All' && (
                    <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant tracking-widest">Events</h3>
                  )}
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="p-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-xs mb-sm">
                        <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-on-secondary-container">campaign</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Event</span>
                      </div>
                      <h3 className="font-headline-md text-[20px] text-on-surface mb-sm leading-snug">{event.title}</h3>
                      {event.imageUrl && (
                        <img alt={event.title} className="w-full h-40 object-cover rounded-lg mb-md" src={event.imageUrl} />
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-on-surface-variant font-label-md text-label-md text-sm">
                          {event.organizer} · {event.date}
                        </p>
                        <button className="text-primary font-bold font-label-md text-label-md hover:underline shrink-0 ml-sm">Register</button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

            </div>

            {/* ── RIGHT SIDEBAR (desktop) ── */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant space-y-md sticky top-28">
                <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant">Suggested Searches</h3>
                <div className="flex flex-wrap gap-sm">
                  {['#AI_Agents', '#Rust_Dev', '#VentureCapital', '#Scalability', '#UI_Design'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag.replace('#', '').replace('_', ' '))}
                      className="bg-surface-container-lowest px-md py-xs rounded-lg border border-outline-variant text-label-md text-primary font-medium hover:bg-primary hover:text-white transition-all"
                    >{tag}</button>
                  ))}
                </div>
                <div className="pt-md border-t border-outline-variant/30 space-y-md">
                  <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant">Trending Topics</h3>
                  <ul className="space-y-md">
                    {results.topics.slice(0, 4).map((t) => (
                      <li key={t.id} className="group cursor-pointer" onClick={() => { setQuery(t.name.replace('#', '')); setActiveFilter('Topics'); }}>
                        <p className="text-on-surface-variant text-label-sm uppercase">{t.category}</p>
                        <p className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">{t.name}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-[0_-1px_10px_rgba(0,0,0,0.05)] border-t border-outline-variant md:hidden">
        <div className="flex justify-around items-center h-16 w-full px-margin-mobile">
          <Link href="/feed"    className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-[10px]">Home</span>
          </Link>
          <Link href="/search"  className="flex flex-col items-center justify-center gap-1 text-primary active:scale-95 duration-150">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="font-label-sm text-[10px] font-bold">Search</span>
          </Link>
          <Link href="/feed"    className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">feed</span>
            <span className="font-label-sm text-[10px]">Feed</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
