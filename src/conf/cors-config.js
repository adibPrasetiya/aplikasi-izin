export const corsOptions = {
  origin: "http://localhost:3000", // Ganti dengan URL frontend Anda
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Penting: Agar kredensial (cookies, header) bisa diterima
  exposedHeaders: "Authorization",
};
