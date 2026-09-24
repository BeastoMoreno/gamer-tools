'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Command,
  Gamepad2,
  Grid2X2,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  X,
  Zap,
  UserRound,
  LogIn,
} from 'lucide-react';
import { tools } from '@/lib/catalog';
import { ToolIcon } from './icons';
import { useGamer } from './gamer-provider';
import { useAuth } from './auth-provider';

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="I Am Gamer home">
      <span className="brand-mark">
        <Gamepad2 size={24} />
      </span>
      <span>
        I AM
        <span className="brand-gamer">
          GAMER<span className="brand-period">.</span>
        </span>
      </span>
    </Link>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { favorites, results, ready } = useGamer();
  const account = useAuth();
  const [query, setQuery] = useState('');
  const searchDialog = useRef<HTMLDialogElement>(null);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchResults = tools.filter((tool) =>
    `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const openSearch = () => {
    searchDialog.current?.showModal();
    searchInput.current?.focus();
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const navigation = (
    <>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation" className="nav-group">
        {[
          { href: '/', name: 'Overview', icon: LayoutDashboard },
          { href: '/tools', name: 'All tools', icon: Grid2X2 },
          { href: '/favorites', name: 'Favorites', icon: Heart },
          { href: '/progress', name: 'My progress', icon: TrendingUp },
        ].map(({ href, name, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => menuDialog.current?.close()}
            className={`nav-link ${pathname === href ? 'active' : ''}`}
            aria-current={pathname === href ? 'page' : undefined}
          >
            <Icon size={18} />
            <span>{name}</span>
            {name === 'All tools' && <span className="nav-count">12</span>}
            {name === 'Favorites' && favorites.length > 0 && (
              <span className="nav-count">{favorites.length}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="nav-caption">LEVEL UP</div>
      <nav aria-label="Training tools" className="nav-group">
        {tools
          .filter((tool) => tool.category === 'Training')
          .map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={`nav-link ${pathname === `/tools/${tool.id}` ? 'active' : ''}`}
              onClick={() => menuDialog.current?.close()}
            >
              <ToolIcon name={tool.icon} size={18} />
              <span>{tool.name}</span>
              {tool.id === 'aim' && <span className="new-pill">HOT</span>}
            </Link>
          ))}
      </nav>
      <div className="nav-caption">THE EXTRAS</div>
      <nav aria-label="Resources" className="nav-group">
        <Link
          href="/guides"
          className={`nav-link ${pathname.startsWith('/guides') ? 'active' : ''}`}
          onClick={() => menuDialog.current?.close()}
        >
          <BookOpen size={18} />
          Gamer guides
          <ArrowUpRight size={14} className="nav-end" />
        </Link>
        <Link
          href="/settings"
          className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}
          onClick={() => menuDialog.current?.close()}
        >
          <Settings2 size={18} />
          Preferences
        </Link>
      </nav>
      <nav className="nav-group account-navigation" aria-label="Account">
        <Link
          href="/profile"
          className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
          onClick={() => menuDialog.current?.close()}
        >
          <UserRound size={18} />
          Player profile
        </Link>
        {!account.user && (
          <>
            <Link href="/sign-in" className="nav-link" onClick={() => menuDialog.current?.close()}>
              <LogIn size={18} />
              Sign in
            </Link>
            <Link href="/sign-up" className="nav-link" onClick={() => menuDialog.current?.close()}>
              <UserRound size={18} />
              Create account
            </Link>
          </>
        )}
      </nav>
      <div className="sidebar-promo">
        <span className="promo-icon">
          <Zap size={19} />
        </span>
        <strong>A little better. Every day.</strong>
        <p>Your next personal best starts with a little practice.</p>
        <Link href="/tools/reaction" onClick={() => menuDialog.current?.close()}>
          Take a quick challenge <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="sidebar-bottom">
        <ShieldCheck size={15} />
        <span>Free tools. Zero downloads.</span>
        <span className="status-dot" />
      </div>
    </>
  );
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        {navigation}
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            disabled={!ready}
            onClick={() => menuDialog.current?.showModal()}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>
              {pathname === '/'
                ? 'Overview'
                : pathname.startsWith('/tools/')
                  ? tools.find((tool) => pathname.endsWith('/' + tool.id))?.name || 'Tools'
                  : pathname.startsWith('/guides/')
                    ? 'Gamer guides'
                    : {
                        '/tools': 'All tools',
                        '/favorites': 'Favorites',
                        '/progress': 'My progress',
                        '/guides': 'Gamer guides',
                        '/settings': 'Preferences',
                        '/profile': 'Player profile',
                        '/sign-in': 'Sign in',
                        '/sign-up': 'Create account',
                        '/forgot-password': 'Password reset',
                        '/reset-password': 'New password',
                      }[pathname] || 'Explore'}
            </strong>
          </div>
          <button className="search-trigger" onClick={openSearch} disabled={!ready}>
            <Search size={16} />
            <span>Find your next advantage...</span>
            <kbd>
              <Command size={11} /> K
            </kbd>
          </button>
          <div className="header-actions">
            <span className="local-badge">
              <span className="status-dot" />
              All systems go
            </span>
            <Link href="/tools/session" className="icon-button" aria-label="Open session timer">
              <Timer size={19} />
            </Link>
            <span className="header-divider" />
            {account.user ? (
              <Link
                href="/profile"
                className="profile-avatar"
                aria-label="Open your player profile"
              >
                <UserRound size={18} />
                <span />
              </Link>
            ) : (
              <div className="header-auth">
                <Link href="/sign-in" className="header-signin">
                  Sign in
                </Link>
                <Link href="/sign-up" className="primary-button header-signup">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="page-content" key={pathname}>
          {children}
        </main>
        <footer className="app-footer">
          <span>
            Built for the love of the game<span className="footer-star">✦</span>
          </span>
          <span>
            <ShieldCheck size={13} />
            Private profile. Local practice.
          </span>
          <span>I AM GAMER © 2026</span>
        </footer>
      </div>
      <dialog
        ref={menuDialog}
        className="mobile-drawer"
        onClick={(event) => {
          if (event.target === event.currentTarget) menuDialog.current?.close();
        }}
      >
        <div className="drawer-heading">
          <Brand />
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => menuDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {navigation}
      </dialog>
      <dialog
        ref={searchDialog}
        className="command-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) searchDialog.current?.close();
        }}
        aria-label="Find a gaming tool"
      >
        <div className="command-search">
          <Search size={20} />
          <input
            ref={searchInput}
            aria-label="Search gaming tools"
            placeholder="What do you want to improve?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="key-button" onClick={() => searchDialog.current?.close()}>
            Esc
          </button>
        </div>
        <div className="command-caption">
          {query ? `${searchResults.length} tools found` : 'YOUR NEXT ADVANTAGE'}
        </div>
        <div className="command-results">
          {searchResults.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              onClick={() => {
                searchDialog.current?.close();
                setQuery('');
              }}
            >
              <span className={`tool-icon ${tool.color}`}>
                <ToolIcon name={tool.icon} size={19} />
              </span>
              <span>
                <strong>{tool.name}</strong>
                <small>
                  {tool.category} · {tool.detail}
                </small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
          {searchResults.length === 0 && (
            <div className="empty-search">
              <Search size={28} />
              <p>No tools found. Try “mouse” or “aim”.</p>
            </div>
          )}
        </div>
        <div className="command-footer">
          <Sparkles size={14} />
          12 tools, endless room to improve.<span>{results.length} sessions completed</span>
        </div>
      </dialog>
    </>
  );
}
