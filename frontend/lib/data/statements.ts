import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getStatementUploads(limit = 20) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('bank_statements')
    .select('id,original_filename,mime_type,status,uploaded_at,storage_path')
    .order('uploaded_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

export async function getOcrDraftRows(limit = 50) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('ocr_extracted_transactions')
    .select('id,statement_id,description,amount,direction,confidence,status,extracted_date,raw_text,category_id')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}
