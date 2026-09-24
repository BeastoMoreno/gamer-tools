'use client';
import Link from 'next/link';
import { Gamepad2, RotateCcw } from 'lucide-react';
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="empty-state">
      <Gamepad2 size={45} />
      <div className="eyebrow">A QUICK TIMEOUT</div>
      <h1>Let’s give that another shot.</h1>
      <p>
        Something interrupted this page. Your previously saved results are still stored on this
        device.
      </p>
      <div className="tool-actions">
        <button className="primary-button" onClick={retry}>
          <RotateCcw size={15} />
          Try again
        </button>
        <Link href="/" className="subtle-button">
          Back to overview
        </Link>
      </div>
    </div>
  );
}
