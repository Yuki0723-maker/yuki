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
    candidate_id: String(formData.get('candidate_id') ?? ''),
    organization_id: String(formData.get('organization_id') ?? ''),
    stage: String(formData.get('stage') ?? '書類'),
    stage_status: String(formData.get('stage_status') ?? '調整中'),
    next_action: str(formData.get('next_action')),
    next_date: str(formData.get('next_date')),
    notes: str(formData.get('notes')),
  };
}

export async function createPlacement(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('placements')
    .insert(payload(formData))
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/placements');
  redirect(`/placements/${data.id}`);
}

export async function updatePlacement(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('placements')
    .update(payload(formData))
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/placements');
  revalidatePath(`/placements/${id}`);
  redirect(`/placements/${id}`);
}

export async function deletePlacement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('placements').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/placements');
  redirect('/placements');
}
