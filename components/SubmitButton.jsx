"use client";

import { useFormStatus } from 'react-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SubmitButton({
  children,
  pendingText = 'Memproses...',
  className = 'btn-primary',
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending && <LoadingSpinner className="h-4 w-4" label={pendingText} />}
      <span>{pending ? pendingText : children}</span>
    </button>
  );
}
