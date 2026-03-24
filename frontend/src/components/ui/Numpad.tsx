

interface NumpadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function Numpad({ onKeyPress, onDelete, disabled = false }: NumpadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-4 text-gray-800">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKeyPress(key)}
          disabled={disabled}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-container-lowest text-3xl font-medium text-on-surface shadow-ambient transition-all hover:bg-surface-container-low hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:pointer-events-none"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onKeyPress('0')}
        disabled={disabled}
        className="col-span-2 flex h-20 items-center justify-center rounded-2xl bg-surface-container-lowest text-3xl font-medium text-on-surface shadow-ambient transition-all hover:bg-surface-container-low hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:pointer-events-none"
      >
        0
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="flex h-20 items-center justify-center rounded-2xl bg-primary-container text-xs font-bold tracking-widest text-primary transition-all hover:bg-primary/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none uppercase"
      >
        Effacer
      </button>
    </div>
  );
}
