import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      id: "kp_3f07298972e942cd83f46d6a673d4723",
      email: "joshuakartes@gmail.com"
    },
    update: {},
    create: {
      email: "joshuakartes@gmail.com"
  }});
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
