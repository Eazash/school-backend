const prisma = require("./prisma");
const bcrypt = require("bcrypt");

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      password: hashedAdminPassword,
      role: "admin",
      fullName: "Administrator"
    },
  });
  console.log("Admin account created successfully");
  const assistantPassword = process.env.ASSISTANT_PASSWORD;
  const hashedAssistantPassword = await bcrypt.hash(assistantPassword, 10);
  const assistantAdmin = await prisma.user.upsert({
    where: {
      username: "assistant-admin"
    },
    update: {},
    create: {
      username: "assistant-admin",
      password: hashedAssistantPassword,
      role: "assistant-admin",
      fullName: "Assistant Admin"
    }
  })
  console.log("Assistant Admin account Created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });