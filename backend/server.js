require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const assetRoutes = require("./routes/asset"); // for Asset
const approvalRoutes = require('./routes/approval');
const maintenanceRoutes = require('./routes/maintenance');
const adminProfileRoutes = require("./routes/adminProfile");
const emailRoutes = require("./routes/email");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);    // for signup/login
app.use('/api/users', userRoutes);   // admin/staff functions (later)
app.use('/api/approvals', approvalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use("/api/admin-profile", adminProfileRoutes);
app.use("/api/all-members", require("./routes/allMembers"));
app.use("/api/email", emailRoutes);




app.use("/api/assets", assetRoutes); // for asset

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected ✅'))
.catch(err => console.error('MongoDB Connection Failed ❌', err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
