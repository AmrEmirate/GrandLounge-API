import {
  PrismaClient,
  UserRole,
  BookingStatus,
  RoomCategory,
  BedOption,
  AdjustmentType,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Comprehensive Seeding...");

  // 1. Clean Database
  console.log("🧹 Cleaning database...");
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

  // 2. Master Data
  console.log("🏗️ Creating Master Data...");
  const categoriesData = [
    "Hotel",
    "Villa",
    "Apartment",
    "Resort",
    "Cabin",
    "Cottage",
  ];
  const categories = await Promise.all(
    categoriesData.map((name) => prisma.category.create({ data: { name } }))
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
    amenitiesData.map((name) => prisma.amenity.create({ data: { name } }))
  );

  const cities = [];
  const cityNames = [
    "Jakarta",
    "Bali",
    "Bandung",
    "Surabaya",
    "Yogyakarta",
    "Semarang",
    "Medan",
    "Makassar",
    "Palembang",
    "Balikpapan",
  ];
  for (let i = 0; i < cityNames.length; i++) {
    cities.push(
      await prisma.city.create({
        data: {
          name: cityNames[i],
          provinsi: "Indonesia", // Simplified
          latitude: -6.2 + i * 0.5,
          longitude: 106.8 + i * 0.5,
        },
      })
    );
  }

  // 3. Users (Demo Accounts)
  console.log("👤 Creating Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Demo Tenant
  const demoTenantUser = await prisma.user.create({
    data: {
      fullName: "Demo Tenant",
      email: "tenant@demo.com",
      password: hashedPassword,
      role: UserRole.TENANT,
      verified: true,
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    },
  });
  const demoTenantProfile = await prisma.tenant.create({
    data: {
      userId: demoTenantUser.id,
      companyName: "Grand Demo Corp",
      addressCompany: "Jl. Demo Raya No. 1",
      phoneNumberCompany: "081234567890",
    },
  });

  // Demo Customer
  const demoCustomerUser = await prisma.user.create({
    data: {
      fullName: "Demo Customer",
      email: "user@demo.com",
      password: hashedPassword,
      role: UserRole.USER,
      verified: true,
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    },
  });

  // Additional Random Users
  const randomTenants = [];
  const randomCustomers = [];
  for (let i = 1; i <= 5; i++) {
    const tUser = await prisma.user.create({
      data: {
        fullName: `Tenant ${i}`,
        email: `tenant${i}@example.com`,
        password: hashedPassword,
        role: UserRole.TENANT,
        verified: true,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=Tenant${i}`,
      },
    });
    const tProfile = await prisma.tenant.create({
      data: {
        userId: tUser.id,
        companyName: `Company ${i}`,
        addressCompany: `Address ${i}`,
        phoneNumberCompany: `08110000${i}`,
      },
    });
    randomTenants.push({ user: tUser, tenant: tProfile });

    const cUser = await prisma.user.create({
      data: {
        fullName: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: hashedPassword,
        role: UserRole.USER,
        verified: true,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=Customer${i}`,
      },
    });
    randomCustomers.push(cUser);
  }

  const allTenants = [
    { user: demoTenantUser, tenant: demoTenantProfile },
    ...randomTenants,
  ];
  const allCustomers = [demoCustomerUser, ...randomCustomers];

  // 4. Properties & Rooms
  console.log("hotel Creating Properties & Rooms...");
  const properties = [];
  const rooms = [];

  for (const { tenant } of allTenants) {
    // Each tenant gets 2-3 properties
    const numProps = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numProps; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const randomAmenities = amenities
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

      const prop = await prisma.property.create({
        data: {
          tenantId: tenant.id,
          name: `${tenant.companyName} ${category.name} ${i + 1}`,
          description: `Enjoy a luxurious stay at our ${category.name}. Located in the heart of ${city.name}, ensuring a memorable experience.`,
          address: `Jl. Property No. ${Math.floor(Math.random() * 100)}`,
          zipCode: `1000${i}`,
          cityId: city.id,
          categoryId: category.id,
          mainImage: `https://picsum.photos/seed/${category.name}${i}/800/600`,
          latitude: city.latitude + (Math.random() - 0.5) * 0.1,
          longitude: city.longitude + (Math.random() - 0.5) * 0.1,
          amenities: { connect: randomAmenities.map((a) => ({ id: a.id })) },
        },
      });
      properties.push(prop);

      // Property Images
      await prisma.propertyImage.createMany({
        data: [1, 2, 3].map((idx) => ({
          propertyId: prop.id,
          imageUrl: `https://picsum.photos/seed/${prop.id}${idx}/800/600`,
        })),
      });

      // Rooms (Standard, Deluxe, Suite)
      const roomTypes = [
        {
          cat: RoomCategory.STANDARD,
          name: "Standard Room",
          price: 500000,
          cap: 2,
          bed: BedOption.DOUBLE,
        },
        {
          cat: RoomCategory.DELUXE,
          name: "Deluxe Room",
          price: 1000000,
          cap: 3,
          bed: BedOption.TWIN,
        },
        {
          cat: RoomCategory.SUITE,
          name: "Executive Suite",
          price: 2500000,
          cap: 4,
          bed: BedOption.DOUBLE,
        },
      ];

      for (const type of roomTypes) {
        const room = await prisma.room.create({
          data: {
            propertyId: prop.id,
            name: type.name,
            description: `A spacious ${type.name.toLowerCase()} with great view.`,
            category: type.cat,
            bedOption: type.bed,
            capacity: type.cap,
            basePrice: type.price,
          },
        });
        rooms.push(room);

        // 5. Availability & Peak Seasons
        // Generate availability for next 60 days
        const today = startOfDay(new Date());
        const availabilityData = [];

        for (let d = 0; d < 60; d++) {
          const date = addDays(today, d);
          // Randomize price slightly for realism
          const flow = Math.floor(Math.random() * 50000);
          const price = type.price + (Math.random() > 0.5 ? flow : -flow);

          availabilityData.push({
            roomId: room.id,
            date: date,
            price: price,
            isAvailable: true, // Default true, bookings will occupy logic
          });
        }
        await prisma.roomAvailability.createMany({ data: availabilityData });

        // Add a Peak Season
        if (Math.random() > 0.7) {
          await prisma.peakSeason.create({
            data: {
              roomId: room.id,
              name: "Holiday Season",
              startDate: addDays(today, 15),
              endDate: addDays(today, 20),
              adjustmentType: AdjustmentType.PERCENTAGE,
              adjustmentValue: 25,
            },
          });
        }
      }
    }
  }

  // 6. Bookings & Reviews
  console.log("📅 Creating Bookings & Reviews...");
  const bookingStatuses = Object.values(BookingStatus);

  for (let i = 0; i < 50; i++) {
    const customer =
      allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const room = rooms[Math.floor(Math.random() * rooms.length)];

    // Random dates within next 60 days
    const startDayOffset = Math.floor(Math.random() * 50);
    const stayDuration = 1 + Math.floor(Math.random() * 5); // 1-5 nights

    const checkIn = addDays(startOfDay(new Date()), startDayOffset);
    const checkOut = addDays(checkIn, stayDuration);

    const status =
      bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
    const totalPrice = room.basePrice * stayDuration;

    const booking = await prisma.booking.create({
      data: {
        userId: customer.id,
        propertyId: room.propertyId,
        invoiceNumber: `INV-${Date.now()}-${i}`,
        reservationId: `RES-${Date.now()}-${i}`,
        checkIn,
        checkOut,
        totalPrice,
        status,
        paymentDeadline: addDays(new Date(), 1), // Dummy
        paymentProof:
          status !== BookingStatus.MENUNGGU_PEMBAYARAN
            ? "https://placehold.co/600x400?text=Payment+Proof"
            : null,
        bookingRooms: {
          create: {
            roomId: room.id,
            guestCount: room.capacity,
            pricePerNight: room.basePrice,
            numberOfNights: stayDuration,
            totalPrice: totalPrice,
          },
        },
      },
    });

    // Create Review if completed
    if (status === BookingStatus.SELESAI && Math.random() > 0.3) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          propertyId: room.propertyId,
          bookingId: booking.id,
          rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
          comment:
            "Pengalaman menginap yang cukup menyenangkan, fasilitas oke.",
          tenantReply:
            Math.random() > 0.5 ? "Terima kasih atas ulasannya!" : null,
        },
      });
    }
  }

  console.log("✅ Seeding Completed!");
  console.log("-----------------------------------------");
  console.log("🔑 Demo Accounts:");
  console.log("Tenant: tenant@demo.com / password123");
  console.log("User  : user@demo.com / password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
