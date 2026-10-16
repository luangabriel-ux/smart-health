import { useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';
export function InfoDialog({
  title = 'Smart Health',
  message,
  onClose,
}: {
  title?: string;
  message: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} className="info-dialog" onCancel={onClose}>
      <span className="soft-icon teal">
        <Icon name="info" size={24} />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="primary full" onClick={onClose}>
        Entendi
      </button>
    </dialog>
  );
}
