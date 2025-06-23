import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

interface SampleDataGeneratorProps {
  onSampleGenerated: (file: any) => void;
}

export function SampleDataGenerator({ onSampleGenerated }: SampleDataGeneratorProps) {
  const [selectedSample, setSelectedSample] = useState<string>("");

  const sampleDatasets = {
    sales: {
      name: "Sales Data",
      headers: ["Date", "Product", "Salesperson", "Quantity", "Unit Price", "Total", "Region", "Customer"],
      data: [
        ["2024-01-15", "Laptop Pro", "John Smith", 2, 1299.99, 2599.98, "North", "Tech Corp"],
        ["2024-01-16", "Wireless Mouse", "Sarah Johnson", 15, 29.99, 449.85, "South", "Office Solutions"],
        ["2024-01-17", "Keyboard", "Mike Davis", 8, 79.99, 639.92, "East", "StartupHub"],
        ["2024-01-18", "Monitor 27''", "Emily Brown", 3, 299.99, 899.97, "West", "Design Studio"],
        ["2024-01-19", "Laptop Pro", "John Smith", 1, 1299.99, 1299.99, "North", "University"],
        ["2024-01-20", "Tablet", "Lisa Wilson", 5, 399.99, 1999.95, "South", "Education Inc"],
        ["2024-01-21", "Wireless Mouse", "Mike Davis", 20, 29.99, 599.80, "East", "Corporate LLC"],
        ["2024-01-22", "Smartphone", "Sarah Johnson", 7, 699.99, 4899.93, "South", "Retail Chain"],
        ["2024-01-23", "Headphones", "Emily Brown", 12, 149.99, 1799.88, "West", "Music Store"],
        ["2024-01-24", "Laptop Pro", "Lisa Wilson", 4, 1299.99, 5199.96, "South", "Government"]
      ]
    },
    inventory: {
      name: "Inventory Management",
      headers: ["SKU", "Product Name", "Category", "Stock Level", "Reorder Point", "Supplier", "Last Updated", "Status"],
      data: [
        ["LT001", "Gaming Laptop", "Electronics", 45, 10, "TechSupply Co", "2024-01-20", "In Stock"],
        ["MS002", "Wireless Mouse", "Accessories", 150, 25, "PeripheralPro", "2024-01-19", "In Stock"],
        ["KB003", "Mechanical Keyboard", "Accessories", 8, 15, "KeyMaster Ltd", "2024-01-18", "Low Stock"],
        ["MN004", "4K Monitor", "Electronics", 22, 5, "DisplayTech", "2024-01-21", "In Stock"],
        ["TB005", "Tablet Pro", "Electronics", 3, 8, "MobileTech Inc", "2024-01-17", "Critical"],
        ["HP006", "Bluetooth Headphones", "Audio", 67, 20, "SoundWave Co", "2024-01-20", "In Stock"],
        ["CM007", "Webcam HD", "Accessories", 89, 30, "VisionTech", "2024-01-19", "In Stock"],
        ["SP008", "Smartphone", "Electronics", 12, 10, "PhoneCorp", "2024-01-22", "Low Stock"],
        ["CH009", "Charging Cable", "Accessories", 200, 50, "CablePro", "2024-01-18", "In Stock"],
        ["ST010", "External SSD", "Storage", 35, 15, "StorageMax", "2024-01-21", "In Stock"]
      ]
    },
    employees: {
      name: "Employee Records",
      headers: ["Employee ID", "Name", "Department", "Position", "Hire Date", "Salary", "Manager", "Status"],
      data: [
        ["EMP001", "Alice Johnson", "Engineering", "Senior Developer", "2022-03-15", 95000, "John Smith", "Active"],
        ["EMP002", "Bob Chen", "Marketing", "Marketing Manager", "2021-07-22", 78000, "Sarah Davis", "Active"],
        ["EMP003", "Carol Williams", "HR", "HR Specialist", "2023-01-10", 62000, "Mike Wilson", "Active"],
        ["EMP004", "David Brown", "Sales", "Sales Representative", "2022-11-05", 55000, "Lisa Garcia", "Active"],
        ["EMP005", "Eva Rodriguez", "Engineering", "Frontend Developer", "2023-06-18", 72000, "John Smith", "Active"],
        ["EMP006", "Frank Miller", "Finance", "Financial Analyst", "2021-09-12", 68000, "Tom Anderson", "Active"],
        ["EMP007", "Grace Kim", "Operations", "Operations Coordinator", "2022-02-28", 58000, "Amy Taylor", "Active"],
        ["EMP008", "Henry Lee", "Engineering", "DevOps Engineer", "2023-04-03", 85000, "John Smith", "Active"],
        ["EMP009", "Iris White", "Marketing", "Content Specialist", "2023-08-14", 52000, "Sarah Davis", "Active"],
        ["EMP010", "Jack Thompson", "Sales", "Senior Sales Rep", "2020-12-01", 72000, "Lisa Garcia", "Active"]
      ]
    }
  };

  const generateSampleFile = (datasetKey: string) => {
    const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
    if (!dataset) return;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [dataset.headers, ...dataset.data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Generate binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and file
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const file = new File([blob], `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_sample.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Process the file data
    const processedFile = {
      id: Date.now(),
      filename: file.name,
      size: file.size,
      sheets: ["Sheet1"],
      data: {
        "Sheet1": wsData
      }
    };

    onSampleGenerated(processedFile);
  };

  const downloadSampleFile = (datasetKey: string) => {
    const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
    if (!dataset) return;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [dataset.headers, ...dataset.data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Download file
    XLSX.writeFile(wb, `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_sample.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Sample Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Try the application with sample datasets to see AI insights in action.
        </p>
        
        <Select value={selectedSample} onValueChange={setSelectedSample}>
          <SelectTrigger>
            <SelectValue placeholder="Choose sample dataset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Data</SelectItem>
            <SelectItem value="inventory">Inventory Management</SelectItem>
            <SelectItem value="employees">Employee Records</SelectItem>
          </SelectContent>
        </Select>

        {selectedSample && (
          <div className="space-y-2">
            <Button 
              onClick={() => generateSampleFile(selectedSample)}
              className="w-full"
              size="sm"
            >
              Load Sample Data
            </Button>
            <Button 
              onClick={() => downloadSampleFile(selectedSample)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Download className="mr-2 w-4 h-4" />
              Download as Excel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}