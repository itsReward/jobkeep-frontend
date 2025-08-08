// src/services/api/vehicles.ts
import { ApiService } from './base'

export interface Vehicle {
    id: string
    model: string
    regNumber: string
    make: string
    color: string
    chassisNumber: string
    clientId: string
    clientName?: string
    clientSurname?: string
}

export interface CreateVehicleRequest {
    model: string
    regNumber: string
    make: string
    color: string
    chassisNumber: string
    clientId: string
}

export interface UpdateVehicleRequest {
    model?: string
    regNumber?: string
    make?: string
    color?: string
    chassisNumber?: string
    clientId?: string
}

export class VehicleService extends ApiService {
    constructor() {
        super('/vehicles')
    }

    async getAll(): Promise<Vehicle[]> {
        return this.get<Vehicle[]>('/all')
    }

    async getById(id: string): Promise<Vehicle> {
        return this.get<Vehicle>(`/get/${id}`)
    }

    async create(vehicle: CreateVehicleRequest): Promise<Vehicle> {
        return this.post<Vehicle>('/new', vehicle)
    }

    async update(id: string, vehicle: UpdateVehicleRequest): Promise<Vehicle> {
        return this.put<Vehicle>(`/update/${id}`, vehicle)
    }

    async delete(id: string): Promise<{ message: string }> {
        return super.delete<{ message: string }>(`/delete/${id}`)
    }

    // Additional utility methods
    async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        const term = searchTerm.toLowerCase()

        return vehicles.filter(vehicle =>
            vehicle.model.toLowerCase().includes(term) ||
            vehicle.make.toLowerCase().includes(term) ||
            vehicle.regNumber.toLowerCase().includes(term) ||
            vehicle.color.toLowerCase().includes(term) ||
            vehicle.chassisNumber.toLowerCase().includes(term) ||
            vehicle.clientName?.toLowerCase().includes(term) ||
            vehicle.clientSurname?.toLowerCase().includes(term)
        )
    }

    async getVehiclesByMake(make: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        return vehicles.filter(vehicle => vehicle.make.toLowerCase() === make.toLowerCase())
    }

    async getVehiclesByClient(clientId: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        return vehicles.filter(vehicle => vehicle.clientId === clientId)
    }

    async getVehiclesByColor(color: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        return vehicles.filter(vehicle => vehicle.color.toLowerCase() === color.toLowerCase())
    }
}

export const vehicleService = new VehicleService()