const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const addRoutes = require("./routes/addRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const updateRoutes = require("./routes/updateRoutes");
const adminRoutes = require("./routes/adminRoutes");
const getRoutes = require("./routes/getRoutes");
const countRoutes = require("./routes/countRoutes");
const path = require("path");
dotenv.config();

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: `http://localhost:5173`,
  methods: "GET,PUT,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
    console.log("Connected to MongoDB.");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });


app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/add", addRoutes);
app.use("/delete", deleteRoutes);
app.use("/update", updateRoutes);
app.use("/get", getRoutes);
app.use("/count", countRoutes);

app.use(
  "/uploads/avatar",
  express.static(path.join(__dirname, "uploads/avatar"))
);

app.get("/", (req, res) => res.send("Hello World!"));
