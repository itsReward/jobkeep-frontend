// src/services/api/clients.ts (Updated)
import { ApiService } from './base'
import { Client } from '@/types'

export interface CreateClientRequest {
  clientName: string
  clientSurname: string
  gender: string
  jobTitle: string
  company: string
  phone: string
  email: string
  address: string
}

export interface UpdateClientRequest {
  clientName?: string
  clientSurname?: string
  gender?: string
  jobTitle?: string
  company?: string
  phone?: string
  email?: string
  address?: string
}

export class ClientService extends ApiService {
  constructor() {
    super('/clients')
  }

  async getAll(): Promise<Client[]> {
    return this.get<Client[]>('/all')
  }

  async getById(id: string): Promise<Client> {
    return this.get<Client>(`/get/${id}`)
  }

  async create(client: CreateClientRequest): Promise<Client> {
    return this.post<Client>('/new', client)
  }

  async update(id: string, client: UpdateClientRequest): Promise<Client> {
    return this.put<Client>(`/update/${id}`, client)
  }

  async delete(id: string): Promise<{ message: string }> {
    return super.delete<{ message: string }>(`/delete/${id}`)
  }

  // Additional utility methods
  async searchClients(searchTerm: string): Promise<Client[]> {
    const clients = await this.getAll()
    const term = searchTerm.toLowerCase()

    return clients.filter(client =>
        client.clientName.toLowerCase().includes(term) ||
        client.clientSurname.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone.includes(term) ||
        client.gender.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term) ||
        client.jobTitle?.toLowerCase().includes(term)
    )
  }

  async getClientsByGender(gender: string): Promise<Client[]> {
    const clients = await this.getAll()
    return clients.filter(client => client.gender === gender)
  }

  async getClientsWithVehicles(): Promise<Client[]> {
    const clients = await this.getAll()
    return clients.filter(client => client.vehicles && client.vehicles.length > 0)
  }

  async getClientsWithoutVehicles(): Promise<Client[]> {
    const clients = await this.getAll()
    return clients.filter(client => !client.vehicles || client.vehicles.length === 0)
  }
}

export const clientService = new ClientService()