'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'


export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('signup-email') as string,
    password: formData.get('signup-password') as string,
    confirmPassword: formData.get('confirm-password') as string,
  }

  if (data.password !== data.confirmPassword) {
    redirect('/error')
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    redirect('/error')
  }

  redirect('/confirm')
}