import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_FOUNDER } from "../lib/demoAuth";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_FOUNDER.password, 10);

  await prisma.user.upsert({
    where: { username: DEMO_FOUNDER.username },
    update: {
      passwordHash,
      fullName: DEMO_FOUNDER.fullName,
      role: DEMO_FOUNDER.role,
      department: DEMO_FOUNDER.department,
      active: true,
    },
    create: {
      username: DEMO_FOUNDER.username,
      fullName: DEMO_FOUNDER.fullName,
      passwordHash,
      role: DEMO_FOUNDER.role,
      department: DEMO_FOUNDER.department,
      active: true,
    },
  });

  console.log("Seeded founder");
  console.log("  username:", DEMO_FOUNDER.username);
  console.log("  password:", DEMO_FOUNDER.password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
