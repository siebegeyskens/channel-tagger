import { useState } from 'react'

import { TagFields, useTagForm } from '@/components/tag-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { pickTagColor } from '@/lib/tag-colors'
import { useCreateTag, type Tag } from '@/lib/tags'

export function CreateTagDialog({
  open,
  onOpenChange,
  tags,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Tag[]
  onCreated: (tag: Tag) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
        </DialogHeader>
        <CreateTagDialogForm
          tags={tags}
          onCreated={(tag) => {
            onCreated(tag)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateTagDialogForm({ tags, onCreated }: { tags: Tag[]; onCreated: (tag: Tag) => void }) {
  const createTag = useCreateTag()
  const [color] = useState(() => pickTagColor(tags.map((tag) => tag.color)))
  const form = useTagForm({
    defaultValues: { name: '', color },
    otherTagNames: tags.map((tag) => tag.name),
    onSubmit: async (values) => onCreated(await createTag.mutateAsync(values)),
  })

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-6">
      <TagFields form={form} />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!form.canSave}>
          {form.submitting ? 'Creating…' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}
