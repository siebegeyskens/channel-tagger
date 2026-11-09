import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'

import { TagChip } from '@/components/tag-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TAG_COLOR_NAMES, tagColorClasses } from '@/lib/tag-colors'
import { isDuplicateNameError, type TagInput } from '@/lib/tags'
import { cn } from '@/lib/utils'

const TAG_NAME_MAX_LENGTH = 30

interface TagFormOptions {
  defaultValues: TagInput
  otherTagNames: string[]
  onSubmit: (values: TagInput) => Promise<unknown>
}

export function useTagForm({ defaultValues, otherTagNames, onSubmit }: TagFormOptions) {
  const [name, setName] = useState(defaultValues.name)
  const [color, setColor] = useState(defaultValues.color)
  const [rejectedNames, setRejectedNames] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const trimmed = name.trim()
  const key = trimmed.toLowerCase()
  const isDuplicate =
    otherTagNames.some((other) => other.toLowerCase() === key) || rejectedNames.includes(key)
  const changed = trimmed !== defaultValues.name || color !== defaultValues.color
  const canSave = trimmed.length > 0 && !isDuplicate && changed && !submitting

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSave) return
    setSubmitting(true)
    try {
      await onSubmit({ name: trimmed, color })
    } catch (error) {
      if (isDuplicateNameError(error)) setRejectedNames((names) => [...names, key])
      else toast.error("Couldn't save the tag. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return { name, setName, color, setColor, trimmed, isDuplicate, canSave, submitting, handleSubmit }
}

export function TagFields({ form }: { form: ReturnType<typeof useTagForm> }) {
  const nameId = useId()
  const errorId = useId()
  const colorId = useId()

  return (
    <>
      <div className="flex min-h-10 items-center justify-center rounded-lg border border-dashed p-4">
        <TagChip name={form.trimmed || 'Tag name'} color={form.color} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          value={form.name}
          onChange={(event) => form.setName(event.target.value)}
          maxLength={TAG_NAME_MAX_LENGTH}
          autoComplete="off"
          required
          aria-invalid={form.isDuplicate || undefined}
          aria-describedby={form.isDuplicate ? errorId : undefined}
        />
        {form.isDuplicate && (
          <p id={errorId} className="text-sm text-destructive">
            You already have a tag with this name.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={colorId}>Color</Label>
        <ColorPicker id={colorId} value={form.color} onChange={form.setColor} />
      </div>
    </>
  )
}

export function TagForm({ children, ...options }: TagFormOptions & { children?: React.ReactNode }) {
  const form = useTagForm(options)

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 px-4 pt-2">
        <TagFields form={form} />
        {children}
      </div>

      <div className="sticky bottom-0 mt-auto bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button type="submit" size="lg" className="w-full" disabled={!form.canSave}>
          {form.submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

function ColorPicker({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (color: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="lg"
          className="justify-start gap-3 self-start"
        >
          <span className={cn('size-4 rounded-full', tagColorClasses(value).dot)} />
          <span className="capitalize">{value}</span>
          <ChevronDown className="ml-2 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <fieldset className="grid grid-cols-6 gap-2">
          <legend className="sr-only">Tag colors</legend>
          {TAG_COLOR_NAMES.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={color === value}
              title={color}
              onClick={() => {
                onChange(color)
                setOpen(false)
              }}
              className={cn(
                'flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                tagColorClasses(color).dot,
              )}
            >
              {color === value && <Check className="size-4 text-background" strokeWidth={3} />}
            </button>
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}
