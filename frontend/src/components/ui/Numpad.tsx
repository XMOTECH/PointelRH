

interface NumpadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function Numpad({ onKeyPress, onDelete, disabled = false }: NumpadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 text-gray-800">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKeyPress(key)}
          disabled={disabled}
          className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-2xl sm:text-3xl font-sfpro font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:translate-y-0 disabled:opacity-30 disabled:pointer-events-none"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onKeyPress('0')}
        disabled={disabled}
        className="col-span-2 flex h-14 sm:h-16 md:h-18 lg:h-20 items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-2xl sm:text-3xl font-sfpro font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:translate-y-0 disabled:opacity-30 disabled:pointer-events-none"
      >
        0
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="flex h-14 sm:h-16 md:h-18 lg:h-20 items-center justify-center rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs font-sfpro font-bold tracking-widest text-slate-600 transition-all hover:bg-slate-200/80 hover:text-slate-900 active:scale-95 disabled:opacity-30 disabled:pointer-events-none uppercase"
      >
        Effacer
      </button>
    </div>
  );
}
