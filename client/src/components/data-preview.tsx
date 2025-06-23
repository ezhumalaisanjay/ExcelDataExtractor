import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableIcon, RefreshCw, Upload } from "lucide-react";

interface DataPreviewProps {
  data: any[][] | null;
  sheets: string[];
  currentSheet: string;
  onSheetChange: (sheet: string) => void;
  totalRows: number;
  totalColumns: number;
}

export function DataPreview({ 
  data, 
  sheets, 
  currentSheet, 
  onSheetChange, 
  totalRows, 
  totalColumns 
}: DataPreviewProps) {
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TableIcon className="text-gray-400 w-8 h-8" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No data to preview</h4>
            <p className="text-gray-500 mb-6">Upload an Excel file to see its contents here</p>
            <Button className="inline-flex items-center">
              <Upload className="mr-2 w-4 h-4" />
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const headers = data[0] || [];
  const rows = data.slice(1);
  const displayRows = showAll ? rows : rows.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Preview</CardTitle>
          {sheets.length > 0 && (
            <div className="flex items-center space-x-2">
              <Select value={currentSheet} onValueChange={onSheetChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Sheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((sheet) => (
                    <SelectItem key={sheet} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" aria-label="Refresh preview">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Data Table */}
          <div className="overflow-auto table-scroll max-h-96 border border-gray-200 rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0">
                <TableRow>
                  {headers.map((header: any, index: number) => (
                    <TableHead key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header || `Column ${index + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row: any[], rowIndex: number) => (
                  <TableRow key={rowIndex} className="hover:bg-gray-50">
                    {headers.map((_, colIndex: number) => (
                      <TableCell key={colIndex} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {row[colIndex] || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing first {Math.min(displayRows.length, rows.length)} of {totalRows} rows
            </span>
            {rows.length > 5 && (
              <Button 
                variant="link" 
                onClick={() => setShowAll(!showAll)}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {showAll ? 'Show Less' : 'View All Rows'}
              </Button>
            )}
          </div>

          {/* Data Stats */}
          <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-200">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalRows}</div>
              <div className="text-xs text-gray-500">Rows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalColumns}</div>
              <div className="text-xs text-gray-500">Columns</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
