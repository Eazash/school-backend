const prisma = require("./prisma");
const bcrypt = require("bcrypt");

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
      fullName: "Administrator"
    },
  });
  console.log("Admin account created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });