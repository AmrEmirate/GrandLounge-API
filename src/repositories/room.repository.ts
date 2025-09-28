import { prisma } from '../config/prisma';
import { Room, RoomCategory, BedOption } from '../../prisma/generated/client';

interface RoomData {
  name: string;
  category: RoomCategory;
  description: string;
  bedOption: BedOption;
  capacity: number;
  basePrice: number;
}

class RoomRepository {
  public async create(propertyId: string, data: RoomData): Promise<Room> {
    return await prisma.room.create({
      data: {
        propertyId: propertyId,
        ...data,
      },
    });
  }

  public async findAllByPropertyId(propertyId: string): Promise<Room[]> {
    return await prisma.room.findMany({
      where: { propertyId: propertyId, deletedAt: null },
    });
  }

  public async findById(roomId: string): Promise<Room | null> {
    return await prisma.room.findFirst({
      where: { id: roomId, deletedAt: null },
    });
  }

  public async update(roomId: string, data: Partial<RoomData>): Promise<Room> {
    return await prisma.room.update({
      where: { id: roomId },
      data: data,
    });
  }

  public async delete(roomId: string): Promise<Room> {
    return await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: new Date() },
    });
  }
}

export default new RoomRepository();