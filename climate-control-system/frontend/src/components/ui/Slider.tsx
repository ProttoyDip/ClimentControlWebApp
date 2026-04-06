interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Slider({ value, onChange, min = 16, max = 30 }: SliderProps) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
      />
      <p className="text-xs text-subtle">Target: {value} C</p>
    </div>
  );
}
