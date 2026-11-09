import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'

export function useGoBack(fallback: '/channels' | '/tags') {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  return {
    canGoBack,
    goBack: () => {
      if (canGoBack) router.history.back()
      else void navigate({ to: fallback })
    },
  }
}
