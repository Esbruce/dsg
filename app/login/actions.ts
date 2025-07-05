'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
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

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    redirect('/error')
  }

  // Create user in public users table
  if (signUpData.user?.id) {
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{ 
        id: signUpData.user.id,
        referred_by: null // or get from formData if you have this field
      }])

    if (userError) {
      console.error('Error creating user:', userError)
      // You might want to handle this error differently
    }
  }

  redirect('/')
}