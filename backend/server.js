// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const assetRoutes = require('./routes/asset');
const approvalRoutes = require('./routes/approval');
const maintenanceRoutes = require('./routes/maintenance');
const adminProfileRoutes = require('./routes/adminProfile');
const emailRoutes = require('./routes/email');
const assignedTaskRoutes = require('./routes/assignedTask');
const allMembersRoutes = require('./routes/allMembers');
const assessmentRoutes = require("./routes/assessment");
const requireAuth = require("./middleware/requireAuth");
const invoiceRoutes = require("./routes/invoice");


const app = express();

// Middleware
const corsOptions = {
  origin: 'https://king-s-property-management.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);            // signup/login
app.use('/api/users', userRoutes);           // admin/staff user functions
app.use('/api/approvals', approvalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin-profile', adminProfileRoutes);
app.use('/api/all-members', allMembersRoutes);
app.use('/api/email', emailRoutes);

// Asset Routes
app.use('/api/assets', assetRoutes);          // for asset management page

// Assigned Task Related Routes
app.use('/api/assigned-tasks/assets', assetRoutes);  // fetch assets inside assigned tasks page
app.use('/api/assigned-tasks', assignedTaskRoutes);  // assigned task create/update/status update
app.use('/api', require('./routes/maintenance')); // for ongoing maintenance page
app.use("/api/assessments", requireAuth, assessmentRoutes);
app.use("/api/invoices", invoiceRoutes);




// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected ✅'))
.catch(err => console.error('MongoDB Connection Failed ❌', err));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
