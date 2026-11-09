import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { SubPageHeader } from '@/components/layout/sub-page-header'
import { Message } from '@/components/message'
import { TagForm } from '@/components/tag-form'
import { Button } from '@/components/ui/button'
import { pickTagColor } from '@/lib/tag-colors'
import { tagsQueryOptions, useCreateTag, type Tag } from '@/lib/tags'
import { useGoBack } from '@/lib/use-go-back'

export const Route = createFileRoute('/_authed/tags/new')({ component: CreateTagPage })

function CreateTagPage() {
  const { data, error, refetch, isRefetching } = useQuery(tagsQueryOptions)

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col">
      <SubPageHeader title="Create tag" backTo="/tags" />
      {data ? (
        <CreateTagForm tags={data.tags} />
      ) : error ? (
        <Message text="Couldn't load your tags.">
          <Button variant="secondary" onClick={() => refetch()} disabled={isRefetching}>
            Try again
          </Button>
        </Message>
      ) : null}
    </main>
  )
}

function CreateTagForm({ tags }: { tags: Tag[] }) {
  const { goBack } = useGoBack('/tags')
  const createTag = useCreateTag()
  const [color] = useState(() => pickTagColor(tags.map((tag) => tag.color)))

  return (
    <TagForm
      defaultValues={{ name: '', color }}
      otherTagNames={tags.map((tag) => tag.name)}
      onSubmit={async (values) => {
        await createTag.mutateAsync(values)
        goBack()
      }}
    />
  )
}
