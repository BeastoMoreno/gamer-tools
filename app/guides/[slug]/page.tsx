import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { guides, findTool } from '@/lib/catalog';
import { ToolIcon } from '@/components/icons';
export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: guides.find((guide) => guide.id === slug)?.title || 'Guide not found' };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.id === slug);
  if (!guide) notFound();
  return (
    <article className={`article guide-${guide.color}`}>
      <Link href="/guides" className="back-link">
        <ArrowLeft size={14} />
        All gamer guides
      </Link>
      <div className="eyebrow">
        {guide.category} · {guide.minutes} MIN READ
      </div>
      <h1>{guide.title}</h1>
      <div className="guide-art">
        <ToolIcon name={guide.icon} size={100} strokeWidth={1} />
        <span className="guide-orbit" />
      </div>
      {guide.paragraphs.map(([title, body]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
      <Link href={`/tools/${guide.tool}`} className="primary-button">
        Open {findTool(guide.tool)?.name.toLowerCase()}
        <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}
