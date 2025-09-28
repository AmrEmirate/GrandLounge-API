import RoomRepository from '../repositories/room.repository';
import { PropertyRepository } from '../repositories/property.repository';
import { Room } from '../../prisma/generated/client';
import ApiError from '../utils/apiError';

class RoomService {
    private async verifyPropertyAccess(propertyId: string, tenantId: string): Promise<void> {
        const property = await PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new ApiError(404, 'Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
    }

    private async verifyRoomOwnership(roomId: string, propertyId: string): Promise<Room> {
        const room = await RoomRepository.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            throw new ApiError(404, 'Kamar tidak ditemukan di properti ini.');
        }
        return room;
    }

    public async createRoom(tenantId: string, propertyId: string, data: any): Promise<Room> {
        await this.verifyPropertyAccess(propertyId, tenantId);
        return await RoomRepository.create(propertyId, data);
    }

    public async getRoomsByProperty(tenantId: string, propertyId: string): Promise<Room[]> {
        await this.verifyPropertyAccess(propertyId, tenantId);
        return await RoomRepository.findAllByPropertyId(propertyId);
    }

    public async getRoomById(tenantId: string, propertyId: string, roomId: string): Promise<Room | null> {
        await this.verifyPropertyAccess(propertyId, tenantId);
        const room = await RoomRepository.findById(roomId);
        
        // Mengembalikan null jika kamar bukan milik properti tersebut, tanpa melempar error
        if (!room || room.propertyId !== propertyId) {
            return null;
        }

        return room;
    }

    public async updateRoom(tenantId: string, propertyId: string, roomId: string, data: any): Promise<Room> {
        await this.verifyPropertyAccess(propertyId, tenantId);
        await this.verifyRoomOwnership(roomId, propertyId);
        return await RoomRepository.update(roomId, data);
    }

    public async deleteRoom(tenantId: string, propertyId: string, roomId: string): Promise<Room> {
        await this.verifyPropertyAccess(propertyId, tenantId);
        await this.verifyRoomOwnership(roomId, propertyId);
        return await RoomRepository.delete(roomId);
    }
}

export default new RoomService();