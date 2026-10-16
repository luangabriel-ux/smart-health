import { useEffect, useRef } from 'react';
import { Icon } from './Icon.tsx';
export type RegistrationType = 'water' | 'exercise' | 'meal' | 'habit';
export function ActivitySheet({
  onChoose,
  onWeight,
  onClose,
}: {
  onChoose: (type: RegistrationType) => void;
  onWeight: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} className="activity-sheet" onCancel={onClose}>
      <div className="sheet-handle" />
      <h2>Registrar Atividade de Hoje</h2>
      <p>Escolha o que você gostaria de registrar agora</p>
      <div className="registration-grid">
        <button onClick={() => onChoose('water')}>
          <span className="soft-icon teal">
            <Icon name="water" />
          </span>
          <strong>Ingestão de Água</strong>
          <small>Meta diária de hidratação</small>
        </button>
        <button onClick={() => onChoose('exercise')}>
          <span className="soft-icon yellow">
            <Icon name="dumbbell" />
          </span>
          <strong>Exercício Físico</strong>
          <small>Treino ou esporte</small>
        </button>
        <button onClick={onWeight}>
          <span className="soft-icon purple">
            <Icon name="health" />
          </span>
          <strong>Peso Corporal</strong>
          <small>Atualize seu perfil</small>
        </button>
        <button onClick={() => onChoose('meal')}>
          <span className="soft-icon green">
            <Icon name="food" />
          </span>
          <strong>Refeição Saudável</strong>
          <small>Registre sua alimentação</small>
        </button>
      </div>
      <button className="sheet-cancel full" onClick={onClose}>
        Cancelar
      </button>
    </dialog>
  );
}
