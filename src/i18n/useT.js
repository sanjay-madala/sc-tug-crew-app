import { useStore } from '../store/useStore'
import { t } from './translations'

export function useT() {
  const lang = useStore(s => s.lang)
  return (key) => t(key, lang)
}
