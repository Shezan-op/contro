'use server'

import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  cookieStore.set('contro_auth', 'true', { path: '/' })
  return { success: true }
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  cookieStore.set('contro_auth', 'true', { path: '/' })
  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('contro_auth')
  return { success: true }
}
