import type { PartialDate } from '@shared/db'

export interface PartialDateInputMessages {
  invalidIntegerText?: string
  yearDayWithoutMonthText?: string
}

export interface PartialDateInputValidationResult {
  valid: boolean
  value: PartialDate | null
  errorText?: string
}

export interface PartialDateInputExpose {
  validate: () => PartialDateInputValidationResult
}
