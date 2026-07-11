import { useState, useEffect, useCallback } from 'react'
import {
  subscribe, getCurrentUser, getSession, isOwner, isAuthReady,
  getUserOrders, getAllOrders, getOrder, getStats, getCustomers,
} from '../lib/store'

/* Re-render this component whenever the store changes (this tab or another). */
function useStoreSelector(selector) {
  const [value, setValue] = useState(selector)
  const refresh = useCallback(() => setValue(selector()), [selector])
  useEffect(() => {
    refresh()
    return subscribe(refresh)
  }, [refresh])
  return value
}

export function useAuth() {
  const user = useStoreSelector(getCurrentUser)
  return { user, isLoggedIn: !!user, isOwner: isOwner(), session: getSession() }
}

export function useAuthReady() {
  return useStoreSelector(isAuthReady)
}

export function useUserOrders() {
  return useStoreSelector(getUserOrders)
}
export function useAllOrders() {
  return useStoreSelector(getAllOrders)
}
export function useOrder(id) {
  const sel = useCallback(() => getOrder(id), [id])
  return useStoreSelector(sel)
}
export function useStats() {
  return useStoreSelector(getStats)
}
export function useCustomers() {
  return useStoreSelector(getCustomers)
}
