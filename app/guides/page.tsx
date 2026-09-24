import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { guides } from '@/lib/catalog';
import { ToolIcon } from '@/components/icons';
export const metadata = { title: 'Gamer guides' };
export default function Page() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</div>
          <h1>
            Beyond the scoreboard<span className="purple-text">.</span>
          </h1>
          <p>Practical reads to help you get more out of your gear and your game.</p>
        </div>
      </div>
      <div className="guide-grid">
        {guides.map((guide) => (
          <Link
            className={`guide-card guide-${guide.color}`}
            href={`/guides/${guide.id}`}
            key={guide.id}
          >
            <div className="guide-art">
              <ToolIcon name={guide.icon} size={60} strokeWidth={1} />
              <span className="guide-orbit" />
              <span className="guide-time">{guide.minutes} MIN READ</span>
            </div>
            <div className="guide-copy">
              <span>{guide.category}</span>
              <h3>{guide.title}</h3>
              <p>
                {guide.subtitle}
                <ArrowUpRight size={15} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
