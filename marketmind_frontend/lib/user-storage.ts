export function getUserScopedKey(userId: number | string | null | undefined, key: string) {
  if (userId === null || userId === undefined || userId === '') {
    return `MM_GUEST_${key}`
  }

  return `MM_USER_${userId}_${key}`
}