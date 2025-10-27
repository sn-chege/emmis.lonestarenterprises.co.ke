// Database Fallback Utility
// Provides automatic fallback to localStorage when database is unavailable

export function getStorageKey(entity: string): string {
  return `emmis_${entity}`
}

export function loadFromStorage<T>(entity: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const stored = localStorage.getItem(getStorageKey(entity))
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`[v0] Error loading ${entity} from storage:`, error)
    return defaultValue
  }
}

export function saveToStorage<T>(entity: string, data: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(getStorageKey(entity), JSON.stringify(data))
  } catch (error) {
    console.error(`[v0] Error saving ${entity} to storage:`, error)
  }
}

export function clearStorage(entity: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(getStorageKey(entity))
  } catch (error) {
    console.error(`[v0] Error clearing ${entity} from storage:`, error)
  }
}

// Database connection checker
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // This would be replaced with actual database connection check
    // For now, we'll check if DATABASE_URL is configured
    const hasDbConfig = process.env.DATABASE_URL !== undefined
    return hasDbConfig
  } catch (error) {
    console.error("[v0] Database connection check failed:", error)
    return false
  }
}
