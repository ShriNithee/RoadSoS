const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("./db/database");
const servicesRouter = require("./routes/services");
const contactsRouter = require("./routes/contacts");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      /\.vercel\.app$/,
      /\.onrender\.com$/,
    ];
    if (!origin) return callback(null, true);
    const isAllowed = allowed.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );
    if (isAllowed) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    message: "RoadSoS API is running",
  });
});

app.use("/api/services", servicesRouter);
app.use("/api/contacts", contactsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
