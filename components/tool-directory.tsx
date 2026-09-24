'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Heart, Search } from 'lucide-react';
import { tools } from '@/lib/catalog';
import { useGamer } from './gamer-provider';
import { ToolCard } from './tool-card';
export function ToolDirectory({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [category, setCategory] = useState('All tools');
  const [query, setQuery] = useState('');
  const { favorites, ready } = useGamer();
  const filtered = tools.filter(
    (tool) =>
      (!favoritesOnly || favorites.includes(tool.id)) &&
      (category === 'All tools' || tool.category === category) &&
      `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {favoritesOnly ? 'THE TOOLS YOU COME BACK TO' : 'ALL YOUR TOOLS. ONE PLACE.'}
          </div>
          <h1>
            {favoritesOnly ? 'Your personal loadout' : 'Find your next advantage'}
            <span className="purple-text">.</span>
          </h1>
          <p>
            {favoritesOnly
              ? 'Your favorites, ready whenever you are.'
              : 'Train your skills, check your gear, and make your setup your own.'}
          </p>
        </div>
      </div>
      <div className="directory-controls">
        <div className="category-tabs" role="group" aria-label="Filter tools">
          {['All tools', 'Training', 'Hardware', 'Setup'].map((item) => (
            <button
              key={item}
              disabled={!ready}
              className={category === item ? 'selected' : ''}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="inline-search">
          <Search size={15} />
          <input
            aria-label="Filter tools by name"
            disabled={!ready}
            placeholder="Find a tool..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="results-caption" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'} in your{' '}
        {favoritesOnly ? 'favorites' : 'toolkit'}
      </p>
      <div className="tools-grid">
        {filtered.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          {favoritesOnly && !favorites.length ? <Heart size={36} /> : <Search size={36} />}
          <h2>
            {favoritesOnly && !favorites.length ? 'Build your go-to loadout.' : 'No tools found.'}
          </h2>
          <p>
            {favoritesOnly && !favorites.length
              ? 'Tap the heart on a tool to save it here. Your favorites stay on this device.'
              : 'Try another search or category to find what you need.'}
          </p>
          {favoritesOnly && !favorites.length ? (
            <Link className="primary-button" href="/tools">
              Explore all tools
              <ArrowUpRight size={15} />
            </Link>
          ) : (
            <button
              className="subtle-button"
              onClick={() => {
                setQuery('');
                setCategory('All tools');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
