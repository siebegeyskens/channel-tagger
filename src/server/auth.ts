import { createServerFn } from '@tanstack/react-start'

import { authMiddleware } from './auth-middleware'
import { storeGoogleRefreshToken } from './google-token'

export const saveGoogleToken = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: { refreshToken: string }) => {
    if (typeof input?.refreshToken !== 'string' || !input.refreshToken) {
      throw new Error('Missing refresh token')
    }
    return input
  })
  .handler(({ data, context }) => storeGoogleRefreshToken(context.userId, data.refreshToken))
