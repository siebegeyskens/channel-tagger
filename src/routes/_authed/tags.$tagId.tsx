import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ListFilter, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { SubPageHeader } from '@/components/layout/sub-page-header'
import { Message } from '@/components/message'
import { TagForm } from '@/components/tag-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  tagsQueryOptions,
  useChannelsByTag,
  useDeleteTag,
  useUpdateTag,
  type Tag,
} from '@/lib/tags'
import { useGoBack } from '@/lib/use-go-back'

export const Route = createFileRoute('/_authed/tags/$tagId')({ component: EditTagPage })

function EditTagPage() {
  const { tagId } = Route.useParams()
  const { data, error, refetch, isRefetching } = useQuery(tagsQueryOptions)
  const { goBack } = useGoBack('/tags')
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const tag = data?.tags.find((candidate) => candidate.id === tagId)

  function content() {
    if (error) {
      return (
        <Message text="Couldn't load your tags.">
          <Button variant="secondary" onClick={() => refetch()} disabled={isRefetching}>
            Try again
          </Button>
        </Message>
      )
    }
    if (!data || deleteTag.isSuccess) return null
    if (!tag) {
      return (
        <Message text="This tag doesn't exist anymore.">
          <Button variant="secondary" asChild>
            <Link to="/tags">Back to tags</Link>
          </Button>
        </Message>
      )
    }
    return (
      <TagForm
        key={tag.id}
        defaultValues={{ name: tag.name, color: tag.color }}
        otherTagNames={data.tags.filter((other) => other.id !== tag.id).map((other) => other.name)}
        onSubmit={async (values) => {
          await updateTag.mutateAsync({ id: tag.id, ...values })
          goBack()
        }}
      >
        <ViewChannelsButton tag={tag} />
        <DeleteTagButton
          tag={tag}
          pending={deleteTag.isPending}
          onConfirm={() =>
            deleteTag.mutate(tag.id, {
              onSuccess: () => {
                toast.success(`Deleted "${tag.name}"`)
                goBack()
              },
              onError: () => toast.error("Couldn't delete the tag. Please try again."),
            })
          }
        />
      </TagForm>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col">
      <SubPageHeader title="Edit tag" backTo="/tags" />
      {content()}
    </main>
  )
}

function ViewChannelsButton({ tag }: { tag: Tag }) {
  const channelsByTag = useChannelsByTag()
  const count = channelsByTag?.get(tag.id)?.length
  if (count === 0) return null

  return (
    <Button type="button" variant="outline" className="self-start" asChild>
      <Link to="/channels" search={{ tags: tag.id }}>
        <ListFilter />
        {count === undefined
          ? 'View channels'
          : `View ${count} ${count === 1 ? 'channel' : 'channels'}`}
      </Link>
    </Button>
  )
}

function DeleteTagButton({
  tag,
  pending,
  onConfirm,
}: {
  tag: Tag
  pending: boolean
  onConfirm: () => void
}) {
  const channelsByTag = useChannelsByTag()
  const count = channelsByTag?.get(tag.id)?.length

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="self-start text-destructive"
          disabled={pending}
        >
          <Trash2 />
          Delete tag
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{tag.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {count === undefined
              ? 'It will be removed from every channel that has it.'
              : count === 0
                ? 'No channels have this tag.'
                : `It will be removed from ${count} ${count === 1 ? 'channel' : 'channels'}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
