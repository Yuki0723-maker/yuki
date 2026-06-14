'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function str(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function payload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    status: String(formData.get('status') ?? '面談前'),
    hoikushi_exam_status: str(formData.get('hoikushi_exam_status')),
    desired_region: str(formData.get('desired_region')),
    notes: str(formData.get('notes')),
  };
}

export async function createCandidate(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('candidates')
    .insert(payload(formData))
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/candidates');
  redirect(`/candidates/${data.id}`);
}

export async function updateCandidate(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('candidates')
    .update(payload(formData))
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/candidates');
  revalidatePath(`/candidates/${id}`);
  redirect(`/candidates/${id}`);
}

export async function deleteCandidate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/candidates');
  redirect('/candidates');
}
