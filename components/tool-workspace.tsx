'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Heart } from 'lucide-react';
import { findTool, type ToolId } from '@/lib/catalog';
import { ToolIcon } from './icons';
import { useGamer } from './gamer-provider';
const AimTrainer = dynamic(() => import('./tools/aim-trainer').then((module) => module.AimTrainer));
const ClickSpeed = dynamic(() => import('./tools/training').then((module) => module.ClickSpeed));
const ReactionTest = dynamic(() =>
  import('./tools/training').then((module) => module.ReactionTest),
);
const DisplayTester = dynamic(() =>
  import('./tools/display-tester').then((module) => module.DisplayTester),
);
const GamepadTester = dynamic(() =>
  import('./tools/hardware').then((module) => module.GamepadTester),
);
const KeyboardTester = dynamic(() =>
  import('./tools/hardware').then((module) => module.KeyboardTester),
);
const MouseTester = dynamic(() => import('./tools/hardware').then((module) => module.MouseTester));
const CrosshairStudio = dynamic(() =>
  import('./tools/setup').then((module) => module.CrosshairStudio),
);
const SensitivityCalculator = dynamic(() =>
  import('./tools/setup').then((module) => module.SensitivityCalculator),
);
const SessionTimer = dynamic(() => import('./tools/setup').then((module) => module.SessionTimer));
const MediaTester = dynamic(() => import('./tools/media').then((module) => module.MediaTester));

const components = {
  aim: AimTrainer,
  reaction: ReactionTest,
  cps: ClickSpeed,
  keyboard: KeyboardTester,
  mouse: MouseTester,
  display: DisplayTester,
  gamepad: GamepadTester,
  sensitivity: SensitivityCalculator,
  crosshair: CrosshairStudio,
  session: SessionTimer,
};
export function ToolWorkspace({ id }: { id: ToolId }) {
  const { favorites, toggleFavorite, ready } = useGamer();
  const tool = findTool(id)!;
  const favorite = favorites.includes(id);
  const Component = id !== 'audio' && id !== 'webcam' ? components[id] : null;
  return (
    <div className="tool-workspace">
      <Link className="back-link" href="/tools">
        <ArrowLeft size={14} />
        Back to your toolkit
      </Link>
      <div className="tool-heading">
        <span className={`tool-icon ${tool.color}`}>
          <ToolIcon name={tool.icon} size={26} />
        </span>
        <div>
          <div className="eyebrow">{tool.category.toUpperCase()} / YOUR NEXT ADVANTAGE</div>
          <h1>
            {tool.name}
            <span className="purple-text">.</span>
          </h1>
          <p>{tool.description}</p>
        </div>
        <button
          disabled={!ready}
          className="subtle-button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(id)}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
          {favorite ? 'Saved to favorites' : 'Add to favorites'}
        </button>
      </div>
      {!ready ? (
        <div className="panel" role="status">
          Getting your tool ready…
        </div>
      ) : Component ? (
        <Component />
      ) : (
        <MediaTester kind={id as 'audio' | 'webcam'} key={id} />
      )}
    </div>
  );
}
