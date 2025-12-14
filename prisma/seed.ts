import {
  PrismaClient,
  UserRole,
  BookingStatus,
  RoomCategory,
  BedOption,
  AdjustmentType,
  TokenPurpose,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seeding (20 Data Version)...");

  await prisma.review.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomAvailability.deleteMany();
  await prisma.peakSeason.deleteMany();
  await prisma.room.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Database cleaned.");

  const categoriesData = ["Hotel", "Villa", "Apartment", "Resort", "Cabin"];
  const categories = await Promise.all(
    categoriesData.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const amenitiesData = [
    "WiFi",
    "Swimming Pool",
    "Air Conditioning",
    "Parking",
    "Gym",
    "Restaurant",
    "Bar",
    "Spa",
    "24-Hour Front Desk",
    "Room Service",
    "Balcony",
    "Ocean View",
    "Kitchen",
    "TV",
    "Elevator",
    "Wheelchair Accessible",
    "Breakfast",
    "Pet Friendly",
    "Garden",
    "Terrace",
  ];
  const amenities = await Promise.all(
    amenitiesData.map((name) =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const cities = [];
  for (let i = 1; i <= 20; i++) {
    cities.push(
      await prisma.city.create({
        data: {
          name: `City ${i}`,
          provinsi: `Province ${Math.ceil(i / 5)}`,
          latitude: -6.2 + i * 0.01,
          longitude: 106.8 + i * 0.01,
        },
      })
    );
  }
  console.log("✅ 20 Cities created.");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const tenants = [];
  const customers = [];

  for (let i = 1; i <= 20; i++) {
    const tenantUser = await prisma.user.create({
      data: {
        fullName: `Tenant ${i}`,
        email: `tenant${i}@example.com`,
        password: hashedPassword,
        role: UserRole.TENANT,
        verified: true,
        profilePicture: `https://via.placeholder.com/150?text=Tenant${i}`,
      },
    });

    const tenantProfile = await prisma.tenant.create({
      data: {
        userId: tenantUser.id,
        companyName: `Tenant Corp ${i}`,
        addressCompany: `Jl. Tenant No. ${i}`,
        phoneNumberCompany: `081${i.toString().padStart(8, "0")}`,
      },
    });

    tenants.push({ ...tenantUser, tenant: tenantProfile });

    const customerUser = await prisma.user.create({
      data: {
        fullName: `Customer ${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        role: UserRole.USER,
        verified: true,
        profilePicture: `https://via.placeholder.com/150?text=User${i}`,
      },
    });
    customers.push(customerUser);
  }

  console.log("✅ 20 Tenants & 20 Customers created.");

  const properties = [];
  for (let i = 1; i <= 20; i++) {
    const tenantOwner = tenants[i - 1];
    const cityLoc = cities[i - 1];

    const randomAmenities = amenities
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((a) => ({ id: a.id }));

    const prop = await prisma.property.create({
      data: {
        tenantId: tenantOwner.tenant.id,
        name: `Grand Property ${i}`,
        description: `This is dummy property description number ${i}. Luxury and comfort combined.`,
        address: `Jl. Property No. ${i}`,
        zipCode: `123${i.toString().padStart(2, "0")}`,
        cityId: cityLoc.id,
        categoryId: categories[i % categories.length].id,
        mainImage: `https://via.placeholder.com/600x400?text=Property${i}`,
        latitude: -6.2 + Math.random() * 0.1,
        longitude: 106.8 + Math.random() * 0.1,
        amenities: {
          connect: randomAmenities,
        },
      },
    });

    await prisma.propertyImage.createMany({
      data: [
        {
          propertyId: prop.id,
          imageUrl: `https://via.placeholder.com/600x400?text=Prop${i}-1`,
        },
        {
          propertyId: prop.id,
          imageUrl: `https://via.placeholder.com/600x400?text=Prop${i}-2`,
        },
      ],
    });

    properties.push(prop);
  }
  console.log("✅ 20 Properties created.");

  const rooms = [];
  for (const prop of properties) {
    rooms.push(
      await prisma.room.create({
        data: {
          propertyId: prop.id,
          name: `Standard Room ${prop.name.split(" ").pop()}`,
          description: "Standard comfort room",
          category: RoomCategory.STANDARD,
          bedOption: BedOption.DOUBLE,
          capacity: 2,
          basePrice: 500000,
        },
      })
    );
    rooms.push(
      await prisma.room.create({
        data: {
          propertyId: prop.id,
          name: `Deluxe Room ${prop.name.split(" ").pop()}`,
          description: "Deluxe spacious room",
          category: RoomCategory.DELUXE,
          bedOption: BedOption.TWIN,
          capacity: 4,
          basePrice: 1000000,
        },
      })
    );
  }
  console.log("✅ 40 Rooms created.");

  const today = new Date();
  for (const room of rooms) {
    await prisma.roomAvailability.create({
      data: {
        roomId: room.id,
        date: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ),
        price: room.basePrice,
        isAvailable: true,
      },
    });

    if (Math.random() > 0.8) {
      await prisma.peakSeason.create({
        data: {
          roomId: room.id,
          name: "High Season",
          startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 7),
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: 20,
        },
      });
    }
  }

  const bookings = [];
  for (let i = 1; i <= 20; i++) {
    const cust = customers[i - 1];
    const room = rooms[i - 1];
    const prop = properties.find((p) => p.id === room.propertyId)!;

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10 + i);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const statuses = Object.values(BookingStatus);
    const status = statuses[i % statuses.length];

    const booking = await prisma.booking.create({
      data: {
        userId: cust.id,
        propertyId: prop.id,
        invoiceNumber: `INV-2025-${i.toString().padStart(4, "0")}`,
        reservationId: `RES-2025-${i.toString().padStart(4, "0")}`,
        checkIn: checkIn,
        checkOut: checkOut,
        totalPrice: room.basePrice * 2,
        status: status,
        paymentDeadline: new Date(checkIn.getTime() - 24 * 60 * 60 * 1000),
        paymentProof:
          status !== BookingStatus.MENUNGGU_PEMBAYARAN
            ? "https://via.placeholder.com/proof"
            : null,
        bookingRooms: {
          create: {
            roomId: room.id,
            pricePerNight: room.basePrice,
            numberOfNights: 2,
            guestCount: 2,
            totalPrice: room.basePrice * 2,
          },
        },
      },
    });
    bookings.push(booking);
  }
  console.log("✅ 20 Bookings created.");

  for (const b of bookings) {
    if (b.status === BookingStatus.SELESAI) {
      await prisma.review.create({
        data: {
          userId: b.userId,
          propertyId: b.propertyId,
          bookingId: b.id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: "Great stay! Data dummy generated.",
          tenantReply: Math.random() > 0.5 ? "Thank you!" : null,
        },
      });
    }
  }
  console.log("✅ Reviews created for completed bookings.");

  console.log("🚀 Seeding completed successfully (20 Data Version)!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
