import matrixEn from '@/data/matrix.json'
import matrixEs from '@/data/matrix.es.json'
import type { Locale } from '@/i18n/locales'

export type MatrixData = typeof matrixEn

export function getMatrix(locale: Locale): MatrixData {
  return locale === 'es' ? (matrixEs as MatrixData) : matrixEn
}
