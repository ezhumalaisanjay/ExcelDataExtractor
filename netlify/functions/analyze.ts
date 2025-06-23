import { Handler } from '@netlify/functions';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = "AIzaSyBrcXjJl74fJwtDLgVtZJ3UrEEjUCgaK1U";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Simple in-memory storage reference (same as upload function)
const files = new Map<number, any>();

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
    const pathParts = event.path.split('/');
    const fileId = parseInt(pathParts[pathParts.length - 2]); // Extract ID from path like /api/files/1/analyze

    if (isNaN(fileId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid file ID' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { sheetName } = body;

    // In a real deployment, you'd fetch from a database
    // For demo purposes, we'll analyze the data directly from the request
    const { data, filename } = body;

    if (!data || !Array.isArray(data)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'No data provided for analysis' })
      };
    }

    const headers_data = data[0] || [];
    const sampleRows = data.slice(1, 6);
    
    const dataString = `
File: ${filename || 'Unknown'}
Headers: ${headers_data.join(', ')}
Sample Data (first 5 rows):
${sampleRows.map(row => row.join(' | ')).join('\n')}
Total Rows: ${data.length - 1}
Total Columns: ${headers_data.length}
    `;

    const prompt = `Analyze this Excel data and provide insights:

${dataString}

Please provide:
1. A brief summary of what this data appears to contain
2. Key patterns or trends you notice
3. Data quality observations (missing values, inconsistencies, etc.)
4. Suggested improvements or next steps for analysis

Keep the response concise and practical.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const analysis = response.text || "Analysis could not be completed";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        sheet: sheetName || 'Sheet1',
        availableSheets: ['Sheet1']
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Analysis failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};