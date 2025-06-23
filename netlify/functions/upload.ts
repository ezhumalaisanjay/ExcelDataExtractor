import { Handler } from '@netlify/functions';
import * as XLSX from 'xlsx';

// Simple in-memory storage for Netlify
const files = new Map<number, any>();
let currentFileId = 1;

export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // For Netlify, we'll expect base64 encoded file data
    const body = JSON.parse(event.body || '{}');
    const { fileData, fileName, fileSize } = body;

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'No file data provided' })
      };
    }

    // Validate file extension
    if (!fileName.match(/\.(xls|xlsx)$/i)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Only .xls and .xlsx files are allowed' })
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Process Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const extractedData: any = {};

    // Extract data from all sheets
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      extractedData[sheetName] = jsonData;
    });

    // Store file data
    const fileId = currentFileId++;
    const fileRecord = {
      id: fileId,
      filename: fileName,
      size: fileSize || buffer.length,
      sheets: sheetNames,
      data: extractedData,
      uploadedAt: new Date().toISOString()
    };

    files.set(fileId, fileRecord);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fileRecord)
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Upload failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};