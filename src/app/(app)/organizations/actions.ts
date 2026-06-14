'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function parseNum(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function payload(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    relation_type: String(formData.get('relation_type') ?? 'その他'),
    country: str(formData.get('country')),
    city: str(formData.get('city')),
    contact_person: str(formData.get('contact_person')),
    contact_email: str(formData.get('contact_email')),
    salary_min: parseNum(formData.get('salary_min')),
    salary_max: parseNum(formData.get('salary_max')),
    salary_currency: str(formData.get('salary_currency')) ?? 'JPY',
    hiring_cycle: str(formData.get('hiring_cycle')),
    notes: str(formData.get('notes')),
  };
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizations')
    .insert(payload(formData))
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/organizations');
  redirect(`/organizations/${data.id}`);
}

export async function updateOrganization(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('organizations')
    .update(payload(formData))
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/organizations');
  revalidatePath(`/organizations/${id}`);
  redirect(`/organizations/${id}`);
}

export async function deleteOrganization(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/organizations');
  redirect('/organizations');
}
