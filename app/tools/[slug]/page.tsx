import { notFound } from 'next/navigation';
import { findTool, tools } from '@/lib/catalog';
import { ToolWorkspace } from '@/components/tool-workspace';
export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  return { title: tool?.name || 'Tool not found', description: tool?.description };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) notFound();
  return <ToolWorkspace id={tool.id} />;
}
