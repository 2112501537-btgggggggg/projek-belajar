import { Elysia } from "elysia";
import { userRoutes } from "./routes/user-routes";

const app = new Elysia().use(userRoutes).listen(3001); // Gunakan port berbeda agar tidak bentrok jika port 3000 sedang dipakai

async function runTests() {
  console.log("Menjalankan pengujian API Registrasi User...");
  
  const payload = {
    name: "eko purwanto",
    email: "eko@localhost",
    password: "rahasia" 
  };

  try {
    console.log("\n1. Test Registrasi Baru (Berhasil)");
    let response = await fetch("http://localhost:3001/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    let result = await response.json();
    console.log("Status HTTP:", response.status);
    console.log("Response Body:", result);

    console.log("\n2. Test Registrasi Email Duplikat (Gagal)");
    response = await fetch("http://localhost:3001/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    result = await response.json();
    console.log("Status HTTP:", response.status);
    console.log("Response Body:", result);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    app.stop();
    process.exit(0);
  }
}

runTests();
