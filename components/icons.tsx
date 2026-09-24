import {
  Crosshair,
  Zap,
  Keyboard,
  Mouse,
  Monitor,
  SlidersHorizontal,
  MousePointerClick,
  Gamepad2,
  Focus,
  Mic,
  Video,
  Timer,
  type LucideProps,
} from 'lucide-react';

const icons = {
  crosshair: Crosshair,
  zap: Zap,
  keyboard: Keyboard,
  mouse: Mouse,
  monitor: Monitor,
  sliders: SlidersHorizontal,
  click: MousePointerClick,
  gamepad: Gamepad2,
  focus: Focus,
  mic: Mic,
  video: Video,
  timer: Timer,
};
export function ToolIcon({ name, ...props }: LucideProps & { name: string }) {
  const Icon = icons[name as keyof typeof icons] || Crosshair;
  return <Icon {...props} />;
}
