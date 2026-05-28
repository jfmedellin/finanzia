# FinanzIA OCR boundary

Esta carpeta representa el límite de servicio OCR (backend separado del frontend).

## Estado actual

- Ya existe contrato tipado en `backend/ocr/contract.ts`.
- El flujo funcional actual vive en frontend (`/statements`) con extracción mock determinística para soportar:
  - upload privado a bucket `statements`,
  - generación de filas `draft` en `ocr_extracted_transactions`,
  - corrección manual,
  - confirmación a `transactions` vía RPC `create_finance_transaction`.

## Contrato objetivo

```ts
{
  batchId,
  userId,
  storagePath,
  fileType,
  rows: [{ date, description, amount, direction, confidence, suggestedCategoryId, rawText }]
}
```

## Pendiente para producción

- Reemplazar parser mock por engine OCR real.
- Añadir pipeline asíncrono (colas/reintentos).
- Registrar trazas por lote (batch observability).
