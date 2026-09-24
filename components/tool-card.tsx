'use client';
import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';
import type { Tool } from '@/lib/catalog';
import { ToolIcon } from './icons';
import { useGamer } from './gamer-provider';
export function ToolCard({ tool, index = 0 }: { tool: Tool; index?: number }) {
  const { favorites, toggleFavorite, ready } = useGamer();
  const favorite = favorites.includes(tool.id);
  return (
    <article
      className={`tool-card accent-${tool.color}`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="card-top">
        <span className={`tool-icon ${tool.color}`}>
          <ToolIcon name={tool.icon} size={23} />
        </span>
        {tool.tag && <span className={`tool-tag ${tool.color}`}>{tool.tag}</span>}
        <button
          disabled={!ready}
          className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
          aria-label={`${favorite ? 'Remove' : 'Add'} ${tool.name} ${favorite ? 'from' : 'to'} favorites`}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(tool.id)}
        >
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <Link href={`/tools/${tool.id}`} className="card-link">
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
        <div className="card-bottom">
          <span>
            <span className={`tiny-dot ${tool.color}`} />
            {tool.detail}
          </span>
          <ArrowUpRight size={18} />
        </div>
      </Link>
    </article>
  );
}
