import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema } from "@shared/schema";
import { analyzeExcelData, generateDataInsights } from "./gemini";
import multer from "multer";
import * as XLSX from "xlsx";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(xls|xlsx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xls and .xlsx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload Excel file
  app.post("/api/files/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      
      // Create file record
      const uploadedFile = await storage.createFile({
        filename: `${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: "processing",
        data: null,
        errorMessage: null,
      });

      // Process Excel file
      try {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;
        const extractedData: any = {};

        // Extract data from all sheets
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          extractedData[sheetName] = jsonData;
        });

        // Update file with extracted data
        await storage.updateFile(uploadedFile.id, {
          status: "completed",
          data: extractedData,
          processedAt: new Date(),
        });

        // Generate AI insights for the first sheet
        let aiAnalysis = null;
        try {
          const firstSheetData = extractedData[sheetNames[0]];
          if (firstSheetData && firstSheetData.length > 0) {
            aiAnalysis = await generateDataInsights(firstSheetData);
          }
        } catch (error) {
          console.error("AI analysis failed:", error);
        }

        res.json({
          id: uploadedFile.id,
          filename: uploadedFile.originalName,
          size: uploadedFile.size,
          sheets: sheetNames,
          data: extractedData,
          aiAnalysis,
        });

      } catch (error) {
        // Update file with error
        await storage.updateFile(uploadedFile.id, {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Processing failed",
          processedAt: new Date(),
        });

        res.status(500).json({ 
          message: "Failed to process Excel file", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }

    } catch (error) {
      res.status(500).json({ 
        message: "Upload failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get file by ID
  app.get("/api/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json(file);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve file", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get all files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve files", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Delete file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const deleted = await storage.deleteFile(fileId);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete file", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Analyze Excel data with AI
  app.post("/api/files/:id/analyze", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (!file.data) {
        return res.status(400).json({ message: "File has no data to analyze" });
      }

      const { sheetName } = req.body;
      const fileData = file.data as Record<string, any[][]>;
      const sheets = Object.keys(fileData);
      const targetSheet = sheetName || sheets[0];
      
      if (!fileData[targetSheet]) {
        return res.status(400).json({ message: "Sheet not found" });
      }

      const analysis = await analyzeExcelData(fileData[targetSheet], file.originalName);
      
      res.json({
        analysis,
        sheet: targetSheet,
        availableSheets: sheets
      });

    } catch (error) {
      res.status(500).json({ 
        message: "Analysis failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
