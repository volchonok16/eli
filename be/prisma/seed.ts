import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Российские ели/сосны", slug: "russian-trees" },
  { name: "Пихты", slug: "firs" },
  { name: "Лапники", slug: "branches" },
  { name: "Подставки", slug: "stands" },
];

async function main() {
  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: index },
      create: { ...category, sortOrder: index },
    });
  }
  console.log("Seed: категории созданы");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
