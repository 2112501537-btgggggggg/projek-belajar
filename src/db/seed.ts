import { db } from "./index";
import { users } from "./schema";

async function seed() {
  console.log("Seeding database...");

  const dummyUsers = [
    {
      name: "Bintang Fadillah",
      email: "bintang@example.com",
    },
    {
      name: "John Doe",
      email: "john@example.com",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
    },
  ];

  try {
    for (const user of dummyUsers) {
      await db.insert(users).values(user);
      console.log(`Inserted user: ${user.name}`);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();
