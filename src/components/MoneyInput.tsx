
import { useController, Control } from 'react-hook-form'

export function MoneyInput({ control, name, label }: { control: Control<any>, name: string, label: string }) {
  const { field } = useController({ control, name })
  return (
    <label className="block mb-3">
      <span className="block text-sm mb-1">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        className="w-full border rounded px-3 py-2"
        value={field.value ?? ''}
        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="숫자만 입력"
      />
    </label>
  )
}
