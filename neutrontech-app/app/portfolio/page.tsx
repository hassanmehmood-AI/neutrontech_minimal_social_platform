import Link from 'next/link';

export default function PortfolioPage() {
  const projects = [
    { name: 'SwapFuser.com', url: 'https://www.swapfuser.com', favicon: 'https://www.swapfuser.com/icon.png' },
    { name: 'PetalBird.com', url: 'https://www.petalbird.com', favicon: 'https://www.petalbird.com/favicon.ico' },
    { name: 'PeaceGangPeaceWorld.com', url: 'https://peacegangpeaceworld.com/', favicon: 'https://peacegangpeaceworld.com/icon.png' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-margin-mobile">
      <div className="w-full max-w-[480px]">
        <Link href="/login" className="inline-flex items-center gap-xs text-primary font-label-sm mb-xl hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Login
        </Link>

        <h1 className="font-display text-display text-on-surface mb-xs">Portfolio</h1>
        <p className="font-body-md text-on-surface-variant mb-xl">Projects built by the team.</p>

        <div className="flex flex-col gap-md">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-2xl px-lg py-md hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.favicon}
                    alt={project.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors">
                  {project.name}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
