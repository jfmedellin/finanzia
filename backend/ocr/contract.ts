export type OcrFileType = 'application/pdf' | 'image/png' | 'image/jpeg'

export type OcrDirection = 'income' | 'expense' | 'transfer'

export type OcrExtractedRow = {
  date: string
  description: string
  amount: number
  direction: OcrDirection
  confidence: number
  suggestedCategoryId: string | null
  rawText: string
}

export type OcrBatchPayload = {
  batchId: string
  userId: string
  storagePath: string
  fileType: OcrFileType
  rows: OcrExtractedRow[]
}
