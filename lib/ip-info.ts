interface IPInfo {
  country?: string
  countryCode?: string
  city?: string
  error?: boolean
}

const ipInfoCache = new Map<string, IPInfo>()

export async function getIPInfo(ip: string): Promise<IPInfo> {
  // Return cached result if available
  if (ipInfoCache.has(ip)) {
    return ipInfoCache.get(ip)!
  }

  // Skip local/private IPs
  if (isPrivateIP(ip)) {
    const result = { country: 'Local', countryCode: 'LO' }
    ipInfoCache.set(ip, result)
    return result
  }

  try {
    // Try ip-api.com first (free, no key required)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`, {
      timeout: 3000
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success') {
        const result = {
          country: data.country,
          countryCode: data.countryCode,
          city: data.city
        }
        ipInfoCache.set(ip, result)
        return result
      }
    }
  } catch (error) {
    console.warn('ip-api.com failed:', error)
  }

  try {
    // Fallback to ipapi.co (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.country_name) {
        const result = {
          country: data.country_name,
          countryCode: data.country_code,
          city: data.city
        }
        ipInfoCache.set(ip, result)
        return result
      }
    }
  } catch (error) {
    console.warn('ipapi.co failed:', error)
  }

  // Cache error result to avoid repeated failed requests
  const errorResult = { error: true }
  ipInfoCache.set(ip, errorResult)
  return errorResult
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4) return false
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true
  
  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) return true
  
  return false
}