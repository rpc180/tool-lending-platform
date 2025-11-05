import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------------
  // 1) TOOL CATEGORIES + TYPES
  // -------------------------------
  const categories = [
    {
      name: "Power Tools",
      types: ["Drill/Driver", "Circular Saw", "Jigsaw", "Impact Driver"]
    },
    {
      name: "Lawn & Garden",
      types: ["Shovel", "Rake", "Hedge Trimmer", "Push Mower"]
    },
    {
      name: "Automotive",
      types: ["Socket Set", "Floor Jack", "Torque Wrench"]
    }
  ];

  for (const cat of categories) {
    const created = await prisma.toolCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });

    for (const type of cat.types) {
      await prisma.toolType.upsert({
        where: {
          categoryId_name: {
            categoryId: created.id,
            name: type,
          },
        },
        update: {},
        create: {
          name: type,
          categoryId: created.id,
        },
      });
    }
  }

  // -------------------------------
  // 2) MANUFACTURERS
  // -------------------------------
  const manufacturers = ["Ryobi", "Milwaukee", "DeWalt", "Makita", "Bosch"];
  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: m },
      update: {},
      create: { name: m },
    });
  }

  // -------------------------------
  // 3) COUNTY (for location tagging)
  // -------------------------------
  await prisma.county.upsert({
    where: { fips5: "19153" },
    update: {},
    create: {
      fips5: "19153",
      county: "Polk County",
      state: "IA",
    },
  });

  // -------------------------------
  // 4) TEST USER
  // -------------------------------
  const adam = await prisma.user.upsert({
    where: { email: "testuser@local" },
    update: {},
    create: {
      email: "testuser@local",
      name: "Test User",
      phone: "515-555-5555",
      countyFips: "19153",
      state: "IA",
    },
  });

  // -------------------------------
  // 5) TEST CIRCLE (friend group)
  // -------------------------------
  const circle = await prisma.circle.upsert({
    where: { id: "default-circle" },
    update: {},
    create: {
      id: "default-circle",
      name: "Neighborhood Tool Circle",
      createdBy: adam.id,
      members: {
        create: {
          userId: adam.id,
          role: "owner",
          status: "active",
        },
      },
    },
  });

  // -------------------------------
  // 6) TEST TOOL owned by user
  // -------------------------------
  const drillType = await prisma.toolType.findFirst({
    where: { name: "Drill/Driver" },
  });

  const ryobi = await prisma.manufacturer.findFirst({
    where: { name: "Ryobi" },
  });

  await prisma.tool.upsert({
    where: { id: "seed-tool" },
    update: {},
    create: {
      id: "seed-tool",
      ownerId: adam.id,
      circleId: circle.id,
      typeId: drillType!.id,
      manufacturerId: ryobi!.id,
      model: "Ryobi ONE+ 18V Drill",
      notes: "Includes 2 batteries and charger",
      countyFips: "19153",
      state: "IA",
      visibility: true,
    },
  });

  console.log("✅ Minimal seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
