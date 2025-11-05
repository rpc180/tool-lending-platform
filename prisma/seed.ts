import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Tool categories and types
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
      create: { name: cat.name }
    });

    for (const type of cat.types) {
      await prisma.toolType.upsert({
        where: {
          categoryId_name: {
            categoryId: created.id,
            name: type
          }
        },
        update: {},
        create: {
          name: type,
          categoryId: created.id
        }
      });
    }
  }

  // Manufacturers
  const manufacturers = ["Ryobi", "Milwaukee", "DeWalt", "Makita", "Bosch"];
  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: m },
      update: {},
      create: { name: m }
    });
  }

  // Counties — small initial sample, you can expand later
  await prisma.county.upsert({
    where: { fips5: "19153" },
    update: {},
    create: {
      fips5: "19153",
      county: "Polk County",
      state: "IA"
    }
  });

  console.log("✅ Seed complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());