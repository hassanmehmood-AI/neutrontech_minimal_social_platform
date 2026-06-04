export type Post = {
  id: number;
  userId: number;
  author: string;
  avatar: string;
  time: string;
  tag: string;
  content: string;
  images: string[];
  videoUrl?: string;
  likes: number;
  comments: number;
  likedBy: number[];
};

export type User = {
  id: number;
  name: string;
  username: string;
  role: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
};

export type Topic = {
  id: number;
  name: string;
  category: string;
  posts: string;
};

export type SearchPost = {
  id: number;
  title: string;
  content: string;
  tag: string;
  likes: number;
  comments: number;
  time: string;
  imageUrl?: string;
};

export const db: {
  posts: Post[];
  users: User[];
  topics: Topic[];
  searchPosts: SearchPost[];
} = {
  posts: [
    {
      id: 1,
      userId: 2,
      author: 'Alex Rivera',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjbt27whQ2x4LPBXz3jDeSADMCU3Yo45hTQa8gvoc7QhCcEvAvFkMSv4KLXTl0zLI9GabSVFlwnXJsCFUDHKTTrvFBZLkPYdAv3uhfF9m2lT4orwZcujlP6vJLkcZmPkb8OrCwB64P0FM39UI-DlTRF2OYYMviLyzv03LqwxZFU9UD-Jg1wBs7XolMDVF1X9xnWSdUfNkZ19TsbF7sIU5SSWL5EXiVekPBxE-AERp0PYUOknaibdgFbOMUo-iPNvtb-ksTA70tmQA',
      time: '2h ago',
      tag: 'Innovation Lab',
      content: 'Just deployed the new Quantum Engine API to production. The latency drop is absolutely insane! 🚀 #neutrontech #futureofdev',
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDoCsR5NBU9P_TbUoggqgui5MgyBYOcUQKiOY0M78oAyr6CWsoT9WMTAv4N8UdtubyjcjkspcmUWBba7n2s9ucKwEQOD7UhPeisLagy6-8O_8lbTWg2WCFKmOvsFB__GnbNtaprUHD67A8zgs_Ld601xAyJavB5Ji8nACI80-QRRrE8NuqaBCXZ21uxeC-fRNsai_zNyYVlbBKgln6sgiDjWd6-1jxRh4JK5WfVJIV1pw6iWZrHGXQ6sQLpIZ5yWKlKBxfuQxmIu1Q'],
      likes: 2400,
      comments: 128,
      likedBy: [],
    },
    {
      id: 2,
      userId: 3,
      author: 'Jordan Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFetNZjgZWG6GPzlpMGMREf3qzS-GlZtbIoOsbb9TugA5MbR_04cVXaHxu8pasK-G6xXBFC09g-Ki6JC9OjdvNNSU2fKNJ7qUIU7NQvu-_2lX_E_LhebSWmQrtQQxYDzBaKzkqw229yws6DOZ85LQ8TTYd0YKTjlNwm6WLuE8hYKJlWwwAYcQK8_kpVpLaJZsno7baoS4DUl7cf75KLCzmw6QAPXIAMpHnULquWTCSsaWdWgjg4KJNbmmfgqY1GD0qtVlSvRX-Fik',
      time: '5h ago',
      tag: 'Product Design',
      content: "Working on the new design system for Neutron. We're prioritizing \"technological calm\" and accessibility. What do you think about the new electric blue accents? 💙",
      images: [],
      likes: 842,
      comments: 56,
      likedBy: [],
    },
    {
      id: 3,
      userId: 1,
      author: 'Sarah Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVJ_M8b5hcblyQLnue8xz3rbATkmOILD84FEHyj4fROePqUeabndpY-1eYXG0-vBFQigUtU7LBv2W_0eDnhyv5Rnsr88742NlJ9hmjWiOy4P836ZKO06X9Zkd399GMi52DXu4Aqs63haKwcjCmpjHflnhcBpIq98-x6Lh4rhajvE4Be5IfIHbDJsJ_yh3Ze47iyqh98eec1Boj9-CZFvrAmo_ZxIl9qQpGzy2k0UfzN4A8PNGExuHpqNGKtDsPpcEMgNS00aAK6Tk',
      time: '2 hours ago',
      tag: 'Product Design',
      content: 'Just pushed the new design system updates for the Neutron Tech dashboard. Focusing on precision-engineered typography and better accessibility. 🚀',
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuApG5GQO7DAy5N5J1awoti83z7TWfn6a-gX4jCKKq90F8lw2oiCUomxRIn0QaUMBxhLUY0xcH3m0AwrUdpfS5an-Ljg4BR2VhZ4y8V6HRPgPE5ZKQG_eIkQMCwwCcnsw6ObmTixY36ZM6cJpDx-amlUcZrl53wAjJPX3qEKn00TwVvHJiEouCyEHN2P4VraAd8OUVhhsZZusWBnKNesz3vK5ZAAAf0m-GO9GZNOc9P9h3qWWtm4zvE6ZEFCfZyzN6WI1Io5r3VMHVA'],
      likes: 128,
      comments: 24,
      likedBy: [],
    },
  ],

  users: [
    {
      id: 1,
      name: 'Sarah Chen',
      username: 'sarahchen',
      role: 'Lead Architect @ QuantumLabs',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdR401XnoSFVfB0uDcUZxbx8W6avhC0RRAPle8TFZOeWSY074lp1bKVJWKac2JRPSUHCPG1SDBZ-fhvPt3eHgJSCV_y3aiR2hHUUVqCd3xigBcnIsyIJHV9udSDr17T7yDifO8N1mGaf2olL-wHyegKrgs1j20r6Y-aVPdQ29cD81i4vMHpS8GQDow5TH5EJCzufTiTRcdS5L8xzjellIZn6td7eWvLgsX0Tyzh7230SxYd20z0O8j_V0ooOzGY3RzBmO2XaSlO-o',
      bio: 'Building the future of distributed systems. Ex-Google, Ex-Meta. Passionate about elegant code and strong coffee.',
      followers: 12400,
      following: 312,
      posts: 248,
    },
    {
      id: 2,
      name: 'Alex Rivera',
      username: 'alexrivera',
      role: 'Senior Engineer @ Neutron Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjbt27whQ2x4LPBXz3jDeSADMCU3Yo45hTQa8gvoc7QhCcEvAvFkMSv4KLXTl0zLI9GabSVFlwnXJsCFUDHKTTrvFBZLkPYdAv3uhfF9m2lT4orwZcujlP6vJLkcZmPkb8OrCwB64P0FM39UI-DlTRF2OYYMviLyzv03LqwxZFU9UD-Jg1wBs7XolMDVF1X9xnWSdUfNkZ19TsbF7sIU5SSWL5EXiVekPBxE-AERp0PYUOknaibdgFbOMUo-iPNvtb-ksTA70tmQA',
      bio: 'Quantum computing enthusiast. I make APIs go fast.',
      followers: 5800,
      following: 210,
      posts: 87,
    },
    {
      id: 3,
      name: 'Jordan Chen',
      username: 'jordanchen',
      role: 'Product Designer @ Neutron Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFetNZjgZWG6GPzlpMGMREf3qzS-GlZtbIoOsbb9TugA5MbR_04cVXaHxu8pasK-G6xXBFC09g-Ki6JC9OjdvNNSU2fKNJ7qUIU7NQvu-_2lX_E_LhebSWmQrtQQxYDzBaKzkqw229yws6DOZ85LQ8TTYd0YKTjlNwm6WLuE8hYKJlWwwAYcQK8_kpVpLaJZsno7baoS4DUl7cf75KLCzmw6QAPXIAMpHnULquWTCSsaWdWgjg4KJNbmmfgqY1GD0qtVlSvRX-Fik',
      bio: 'Designing calm technology. Material 3 advocate.',
      followers: 3200,
      following: 180,
      posts: 64,
    },
    {
      id: 4,
      name: 'Marcus Webb',
      username: 'marcuswebb',
      role: 'AI Researcher @ DeepMind',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVJ_M8b5hcblyQLnue8xz3rbATkmOILD84FEHyj4fROePqUeabndpY-1eYXG0-vBFQigUtU7LBv2W_0eDnhyv5Rnsr88742NlJ9hmjWiOy4P836ZKO06X9Zkd399GMi52DXu4Aqs63haKwcjCmpjHflnhcBpIq98-x6Lh4rhajvE4Be5IfIHbDJsJ_yh3Ze47iyqh98eec1Boj9-CZFvrAmo_ZxIl9qQpGzy2k0UfzN4A8PNGExuHpqNGKtDsPpcEMgNS00aAK6Tk',
      bio: 'AGI safety researcher. Former mathematician.',
      followers: 9100,
      following: 95,
      posts: 143,
    },
  ],

  topics: [
    { id: 1, name: '#QuantumComputing',    category: 'Technology',  posts: '14k'  },
    { id: 2, name: '#Web3Sustainability',  category: 'Business',    posts: '8.2k' },
    { id: 3, name: '#NeutronConference24', category: 'Events',      posts: '5.1k' },
    { id: 4, name: '#MinimalistUI',        category: 'Design',      posts: '3.7k' },
    { id: 5, name: '#AIEthics',            category: 'Technology',  posts: '11k'  },
    { id: 6, name: '#RustDevelopment',     category: 'Engineering', posts: '2.3k' },
  ],

  searchPosts: [
    { id: 1, title: 'Designing Scalable Neural Networks for Mobile Devices', content: "Optimizing deep learning models for edge computing requires a radical rethink of traditional architecture. Here's how we achieved 40% efficiency gains.", tag: 'Engineering', likes: 1200, comments: 84,  time: '3h ago' },
    { id: 2, title: 'The Future of Decentralized Storage in Enterprise',       content: 'Exploring how Layer 2 solutions are revolutionizing distributed data nodes for enterprise-scale applications across industries.',                          tag: 'Web3',        likes: 540,  comments: 32,  time: '2h ago', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlam2fKx4NJfrMrTGWQCf4cXaE8h-sCSRQTWRPRMiYaI7qJ73YrN296uOMwo3M1cUqso8JPMooAmKGeKEKe7p1iRWvxLuNyNzYBJ0-Cu2hCnhbtp1q6DnkCpBZ3VCNIXFAmQyJz6GhdgrwwXv5K80vtg_Q18KmtguxTliZ-Ou0YiUSoaah2Yg3rfPzgPT8HCBwI1I3vOlHonBCiycdvydPPBhPT7N5TJ8gOHta8p7EEtc3iHWmUKOZZFxCFC03kbnzf6X5F02JMLQ' },
    { id: 3, title: 'New UI Design System for Neutron Tech Dashboard',          content: 'Pushing the boundaries of precision-engineered typography and accessibility in the new Neutron Tech design system update with improved contrast ratios.', tag: 'Design',      likes: 820,  comments: 56,  time: '1h ago' },
    { id: 4, title: 'Quantum Supremacy: What it Means for Enterprise Security', content: 'With recent breakthroughs in quantum computing, enterprise security models need a fundamental rethink. Here are the key takeaways from the latest research.', tag: 'Technology', likes: 2100, comments: 143, time: '5h ago' },
  ],
};
