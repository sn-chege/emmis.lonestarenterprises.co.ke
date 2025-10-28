const API_BASE_URL = '/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API Error:', { status: response.status, statusText: response.statusText, errorData })
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network connection failed')
    }
  }

  // Users
  async getUsers() {
    return this.request('/users')
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Customers
  async getCustomers() {
    return this.request('/customers')
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`)
  }

  async createCustomer(data: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(id: string, data: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    })
  }

  // Assets
  async getAssets() {
    return this.request('/assets')
  }

  async getAsset(id: string) {
    return this.request(`/assets/${id}`)
  }

  async createAsset(data: any) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAsset(id: string, data: any) {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAsset(id: string) {
    return this.request(`/assets/${id}`, {
      method: 'DELETE',
    })
  }

  // Work Orders
  async getWorkOrders() {
    return this.request('/work-orders')
  }

  async getWorkOrder(id: string) {
    return this.request(`/work-orders/${id}`)
  }

  async createWorkOrder(data: any) {
    return this.request('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWorkOrder(id: string, data: any) {
    return this.request(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteWorkOrder(id: string) {
    return this.request(`/work-orders/${id}`, {
      method: 'DELETE',
    })
  }

  // Maintenance
  async getMaintenanceSchedules() {
    return this.request('/maintenance')
  }

  async getMaintenanceSchedule(id: string) {
    return this.request(`/maintenance/${id}`)
  }

  async createMaintenanceSchedule(data: any) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMaintenanceSchedule(id: string, data: any) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMaintenanceSchedule(id: string) {
    return this.request(`/maintenance/${id}`, {
      method: 'DELETE',
    })
  }

  // Leases
  async getLeases() {
    return this.request('/leases')
  }

  async getLease(id: string) {
    return this.request(`/leases/${id}`)
  }

  async createLease(data: any) {
    return this.request('/leases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateLease(id: string, data: any) {
    return this.request(`/leases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteLease(id: string) {
    return this.request(`/leases/${id}`, {
      method: 'DELETE',
    })
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Activity Logs
  async getActivityLogs(userId?: string, limit = 10) {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    params.append('limit', limit.toString())
    return this.request(`/activity-logs?${params.toString()}`)
  }
}

export const api = new ApiClient()

// Dashboard stats helper
export async function getDashboardStats() {
  try {
    const [users, customers, assets, workOrders, maintenance, leases] = await Promise.all([
      api.getUsers(),
      api.getCustomers(), 
      api.getAssets(),
      api.getWorkOrders(),
      api.getMaintenanceSchedules(),
      api.getLeases()
    ])

    return {
      users: users.length,
      customers: customers.length,
      assets: assets.length,
      workOrders: workOrders.length,
      maintenance: maintenance.length,
      leases: leases.length,
      activeWorkOrders: workOrders.filter((wo: any) => wo.status === 'open' || wo.status === 'inProgress').length,
      overdueWorkOrders: workOrders.filter((wo: any) => new Date(wo.dueDate) < new Date() && wo.status !== 'completed').length,
      activeMaintenance: maintenance.filter((m: any) => m.status === 'scheduled' || m.status === 'inProgress').length,
      activeLeases: leases.filter((l: any) => l.status === 'active').length
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return {
      users: 0,
      customers: 0,
      assets: 0,
      workOrders: 0,
      maintenance: 0,
      leases: 0,
      activeWorkOrders: 0,
      overdueWorkOrders: 0,
      activeMaintenance: 0,
      activeLeases: 0
    }
  }
}