import { useId } from "react";

type SliderProps = {
  value: number;
  onChange: (x: number) => void;
};
export function Slider({ value, onChange }: SliderProps) {
  return (
    <input
      type="range"
      value={value}
      step={0.01}
      min={-1}
      max={1}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
    />
  );
}

type SliderUncontrolledProps = {
  onChange: (x: number) => void;
};
export function SliderUncontrolled({ onChange }: SliderUncontrolledProps) {
  return (
    <input
      type="range"
      defaultValue={0}
      step={0.01}
      min={-1}
      max={1}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
    />
  );
}
