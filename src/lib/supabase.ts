import { createClient } from "@supabase/supabase-js";

export const TEMPLATE_BUCKET = "plan-templates";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars are not set");
  return createClient(url, key);
}

export async function uploadTemplatePdf(
  file: Buffer,
  fileName: string
): Promise<string> {
  const client = getServerClient();
  const { error } = await client.storage
    .from(TEMPLATE_BUCKET)
    .upload(fileName, file, { contentType: "application/pdf", upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = client.storage.from(TEMPLATE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
