import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeExcelData(data: any[][], filename: string): Promise<string> {
  try {
    const headers = data[0] || [];
    const sampleRows = data.slice(1, 6); // First 5 rows for analysis
    
    const dataString = `
File: ${filename}
Headers: ${headers.join(', ')}
Sample Data (first 5 rows):
${sampleRows.map(row => row.join(' | ')).join('\n')}
Total Rows: ${data.length - 1}
Total Columns: ${headers.length}
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

    return response.text || "Analysis could not be completed";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateDataInsights(data: any[][]): Promise<{
  summary: string;
  patterns: string[];
  suggestions: string[];
}> {
  try {
    const headers = data[0] || [];
    const rows = data.slice(1);
    
    // Calculate basic statistics
    const stats = headers.map((header, index) => {
      const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
      return {
        column: header,
        totalValues: rows.length,
        nonEmptyValues: values.length,
        emptyValues: rows.length - values.length,
        uniqueValues: new Set(values).size
      };
    });

    const statsString = stats.map(stat => 
      `${stat.column}: ${stat.nonEmptyValues}/${stat.totalValues} filled (${stat.uniqueValues} unique)`
    ).join('\n');

    const prompt = `Analyze this spreadsheet data structure and provide structured insights:

Headers: ${headers.join(', ')}
Rows: ${rows.length}
Column Statistics:
${statsString}

Respond with JSON in this format:
{
  "summary": "Brief description of the dataset",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            patterns: { 
              type: "array",
              items: { type: "string" }
            },
            suggestions: { 
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "patterns", "suggestions"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || '{}');
    return {
      summary: result.summary || "No summary available",
      patterns: result.patterns || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Gemini insights error:", error);
    return {
      summary: "AI analysis unavailable",
      patterns: [],
      suggestions: []
    };
  }
}