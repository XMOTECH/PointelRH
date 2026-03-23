

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
          className="flex h-20 w-20 items-center justify-center rounded-xl bg-white text-3xl font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:translate-y-0 disabled:opacity-50"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onKeyPress('0')}
        disabled={disabled}
        className="col-span-2 flex h-20 items-center justify-center rounded-xl bg-white text-3xl font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:translate-y-0 disabled:opacity-50"
      >
        0
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="flex h-20 items-center justify-center rounded-xl bg-red-100 text-sm font-bold tracking-wider text-red-600 transition-colors hover:bg-red-200 active:bg-red-300 disabled:opacity-50"
      >
        EFFACER
      </button>
    </div>
  );
}
