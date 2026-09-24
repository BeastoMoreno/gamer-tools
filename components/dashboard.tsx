'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Crosshair,
  Flame,
  Grid2X2,
  Heart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { guides, tools } from '@/lib/catalog';
import { useGamer } from './gamer-provider';
import { GamingArt } from './gaming-art';
import { ToolCard } from './tool-card';
import { ToolIcon } from './icons';
export function Dashboard() {
  const [category, setCategory] = useState('All tools');
  const { results, favorites, ready } = useGamer();
  const filtered = tools.filter(
    (tool) =>
      category === 'All tools' ||
      (category === 'Favorites' ? favorites.includes(tool.id) : tool.category === category),
  );
  const reactionResults = results.filter((result) => result.tool === 'reaction');
  const bestReaction = reactionResults.length
    ? Math.min(...reactionResults.map((result) => result.value))
    : null;
  const today = new Date().toLocaleDateString('en-CA');
  const completedToday = results.some(
    (result) =>
      result.tool === 'reaction' && new Date(result.date).toLocaleDateString('en-CA') === today,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> YOUR GAMING COMPANION
          </div>
          <h1>
            Your next level starts here<span className="purple-text">.</span>
          </h1>
          <p>Test your gear. Sharpen your skills. Get more out of every game.</p>
        </div>
        <Link href="/progress" className="subtle-button">
          <Trophy size={15} />
          My progress
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <section className="hero-grid" aria-label="Welcome to your gaming toolkit">
        <div className="hero-banner">
          <div className="hero-grid-lines" />
          <div className="hero-copy">
            <span className="hero-label">
              <Sparkles size={13} />
              BUILT FOR YOUR NEXT GG
            </span>
            <h2>
              Great gear.
              <br />
              Greater <span>gamer.</span>
            </h2>
            <p>
              Your all-in-one toolkit for the moments
              <br className="desktop-break" /> before the clutch.
            </p>
            <Link href="/tools" className="primary-button">
              Explore the toolkit
              <ArrowUpRight size={17} />
            </Link>
            <div className="hero-perks">
              <span>
                <Check size={12} />
                100% free
              </span>
              <span>
                <Check size={12} />
                No downloads
              </span>
              <span>
                <Check size={12} />
                Just play
              </span>
            </div>
          </div>
          <GamingArt />
          <div className="hero-edition">THE GAMER’S EDGE / VOL. 01</div>
        </div>
        <div className="challenge-card">
          <div className="challenge-top">
            <span>
              <Flame size={15} />
              DAILY WARM-UP
            </span>
            <span className="challenge-day">01 / REFLEX</span>
          </div>
          <div className="challenge-symbol">
            <Zap size={39} fill="currentColor" />
            <span />
            <span />
          </div>
          <h2>
            Fast hands.
            <br />
            Faster reactions.
          </h2>
          <p>
            Five rounds. One goal.
            <br />
            Find your personal best.
          </p>
          <div className="challenge-target">
            <span>{completedToday ? 'TODAY’S CHALLENGE' : 'YOUR PERSONAL BEST'}</span>
            <strong>
              {completedToday ? (
                <>
                  <Check size={17} /> Completed
                </>
              ) : bestReaction ? (
                <>
                  {bestReaction}
                  <small> ms</small>
                </>
              ) : (
                <>
                  Ready when you are
                  <ArrowUpRight size={15} />
                </>
              )}
            </strong>
          </div>
          <Link href="/tools/reaction" className="challenge-button">
            {completedToday ? 'Go for a new best' : 'Take the challenge'}
            <ArrowRight size={16} />
          </Link>
          <span className="challenge-note">A fresh start, any time you need it.</span>
        </div>
      </section>
      <div className="quick-stats">
        <div>
          <span className="stat-icon violet">
            <Grid2X2 size={20} />
          </span>
          <span>
            <strong>
              12<span>powerful tools</span>
            </strong>
            <small>One home for your gaming setup</small>
          </span>
        </div>
        <div>
          <span className="stat-icon mint">
            <ShieldCheck size={21} />
          </span>
          <span>
            <strong>
              100%<span>free. Always.</span>
            </strong>
            <small>No paywalls between you and better</small>
          </span>
        </div>
        <div>
          <span className="stat-icon amber">
            <Trophy size={21} />
          </span>
          <span>
            <strong>
              {results.length}
              <span>sessions completed</span>
            </strong>
            <small>
              {results.length
                ? 'Every session is a step forward'
                : 'Your first personal best is waiting'}
            </small>
          </span>
        </div>
      </div>
      <section className="tool-section" aria-labelledby="tools-heading">
        <div className="section-heading">
          <div>
            <div className="section-kicker">THE RIGHT TOOLS. YOUR ADVANTAGE.</div>
            <h2 id="tools-heading">
              Your gaming toolkit<span className="count-pill">12</span>
            </h2>
          </div>
          <Link href="/tools" className="text-link">
            View all tools
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="category-tabs" role="group" aria-label="Filter tools">
          {['All tools', 'Training', 'Hardware', 'Setup', 'Favorites'].map((item) => (
            <button
              key={item}
              disabled={!ready}
              className={category === item ? 'selected' : ''}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item === 'All tools' ? (
                <Grid2X2 size={14} />
              ) : item === 'Favorites' ? (
                <Heart size={14} />
              ) : item === 'Training' ? (
                <Crosshair size={14} />
              ) : null}
              {item}
              {item === 'All tools' && <span>12</span>}
            </button>
          ))}
          <span className="browser-note">
            <span className="status-dot" />
            Runs right in your browser
          </span>
        </div>
        <div className="tools-grid">
          {filtered.slice(0, 6).map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state compact">
            <Heart size={28} />
            <h3>Your favorites belong here</h3>
            <p>Tap the heart on any tool to keep it close.</p>
          </div>
        )}
        {filtered.length > 6 && (
          <Link href="/tools" className="more-tools">
            There’s more in your toolkit
            <span>
              Explore all 12 tools
              <ArrowRight size={14} />
            </span>
          </Link>
        )}
      </section>
      <section className="guides-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">A LITTLE KNOW-HOW GOES A LONG WAY</div>
            <h2>Beyond the scoreboard</h2>
          </div>
          <Link href="/guides" className="text-link">
            All guides
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="guide-grid">
          {guides.map((guide) => (
            <Link
              href={`/guides/${guide.id}`}
              className={`guide-card guide-${guide.color}`}
              key={guide.id}
            >
              <div className="guide-art">
                <ToolIcon name={guide.icon} size={56} strokeWidth={1} />
                <span className="guide-orbit" />
                <span className="guide-art-plus">+</span>
                <span className="guide-time">{guide.minutes} MIN READ</span>
              </div>
              <div className="guide-copy">
                <span>{guide.category}</span>
                <h3>{guide.title}</h3>
                <p>
                  {guide.subtitle}
                  <ChevronRight size={16} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <div className="bottom-banner">
        <span className="bottom-banner-icon">
          <ToolIcon name="gamepad" size={27} />
        </span>
        <div>
          <h3>Made for gamers. Built for the grind.</h3>
          <p>Play as a guest or make it yours with a profile. No installs needed.</p>
        </div>
        <span className="built-badge">
          <span className="status-dot" /> LET’S GET BETTER
        </span>
      </div>
    </>
  );
}
