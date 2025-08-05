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

  async update(id: string, client: Partial<CreateClientRequest>): Promise<Client> {
    return this.put<Client>(`/update/${id}`, client)
  }

  // @ts-ignore
  async delete(id: string): Promise<string> {
    return super.delete<string>(`/delete/${id}`)
  }
}

export const clientService = new ClientService()
