import Link from 'next/link';
import { Gamepad2, ArrowRight } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="empty-state">
      <Gamepad2 size={48} />
      <div className="eyebrow">404 / OUT OF BOUNDS</div>
      <h1>Let’s get you back in the game.</h1>
      <p>That page isn’t in your loadout. Your tools are right where you left them.</p>
      <Link href="/" className="primary-button">
        Back to overview
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
