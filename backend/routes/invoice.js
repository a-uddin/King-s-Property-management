const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadToS3 = require("../utils/s3Upload");
const Invoice = require("../models/Invoice");
const requireAuth = require("../middleware/requireAuth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", requireAuth, upload.single("invoice"), async (req, res) => {
  try {
    const file = req.file;
    const { taskId, fileName } = req.body;
    if (!file || !taskId) {
      return res.status(400).json({ message: "File and taskId are required." });
    }
    if (!fileName) {
      return res.status(400).json({ message: "File name is required." });
    }
    

    // Upload to S3
    const { url, fileName: uploadedFileName  } = await uploadToS3(file.buffer, fileName, file.mimetype);

    // Save to MongoDB
    const newInvoice = new Invoice({
      submittedBy: req.user.id,
      taskId,
      invoiceUrl: url,
      fileName: fileName,
      fileSize: file.size,
    });

    await newInvoice.save();

    res.status(201).json({ message: "Invoice submitted successfully!", invoice: newInvoice });
  } catch (err) {
    console.error("Invoice upload error:", err.message);
    res.status(500).json({ message: "Invoice upload failed." });
  }
});

// GET /api/invoices
// Admin can get all invoices
router.get("/", async (req, res) => {
    try {
      const invoices = await Invoice.find()
        .populate("submittedBy", "firstName lastName email")
        .populate("taskId", "assetName note assignedFor");

      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoices." });
    }
  });

  // GET /api/invoices/task/:taskId
  // Get Invoices by Task (for External - History button)
router.get("/task/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;

      const invoices = await Invoice.find({ taskId })
        .populate("submittedBy", "firstName lastName email");

      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoice history." });
    }
  });

  // GET /api/invoices/user/:userId
  // Get Invoices Submitted by a User
router.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const invoices = await Invoice.find({ submittedBy: userId })
        .populate("taskId", "assetName note assignedFor");

      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user invoices." });
    }
  });


  // Get all invoices for admin with populated user and task details
router.get('/admin', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('submittedBy', 'firstName lastName') // Populate user name
      .populate('taskId'); // Populate assigned task

    res.json(invoices);
  } catch (error) {
    console.error('Failed to fetch admin invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/invoices/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;

    // Basic validation
    if (!["Pending", "Reviewed", "Approved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.json({ message: "Status updated", invoice });
  } catch (err) {
    console.error("Error updating invoice status:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
