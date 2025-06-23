import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { DataPreview } from "@/components/data-preview";
import { ExportControls } from "@/components/export-controls";
import { AIInsights } from "@/components/ai-insights";
import { SampleDataGenerator } from "@/components/sample-data-generator";
import { DataQualityChecker } from "@/components/data-quality-checker";
import { FileSpreadsheet, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessedFile {
  id: number;
  filename: string;
  size: number;
  sheets: string[];
  data: Record<string, any[][]>;
  aiAnalysis?: {
    summary: string;
    patterns: string[];
    suggestions: string[];
  } | null;
}

export default function Home() {
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [currentSheet, setCurrentSheet] = useState<string>("");

  const handleFileProcessed = (file: ProcessedFile) => {
    setProcessedFile(file);
    if (file.sheets.length > 0) {
      setCurrentSheet(file.sheets[0]);
    }
  };

  const handleSheetChange = (sheet: string) => {
    setCurrentSheet(sheet);
  };

  const handleClear = () => {
    setProcessedFile(null);
    setCurrentSheet("");
  };

  const currentData = processedFile && currentSheet ? 
    processedFile.data[currentSheet] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">XLS Data Extractor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Excel File Processing</h2>
          <p className="text-gray-600">
            Upload and extract data from your Excel files (.xls, .xlsx) with AI-powered insights, real-time preview and export capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Upload and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFileProcessed={handleFileProcessed} />
            {!processedFile && (
              <SampleDataGenerator onSampleGenerated={handleFileProcessed} />
            )}
            <ExportControls 
              data={currentData}
              filename={processedFile?.filename}
              sheetName={currentSheet}
              onClear={handleClear}
              disabled={!processedFile}
            />
            <AIInsights 
              fileId={processedFile?.id || null}
              currentSheet={currentSheet}
              initialInsights={processedFile?.aiAnalysis || null}
            />
          </div>

          {/* Right Column: Data Preview and Quality Check */}
          <div className="lg:col-span-3 space-y-6">
            <DataPreview
              data={currentData}
              sheets={processedFile?.sheets || []}
              currentSheet={currentSheet}
              onSheetChange={handleSheetChange}
              totalRows={currentData ? currentData.length - 1 : 0}
              totalColumns={currentData && currentData.length > 0 ? currentData[0].length : 0}
            />
            
            {processedFile && currentData && (
              <DataQualityChecker
                data={currentData}
                currentSheet={currentSheet}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
