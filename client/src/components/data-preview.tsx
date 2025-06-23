import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TableIcon, RefreshCw, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState("");

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
  
  // Calculate pagination
  const totalPages = Math.ceil(rows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayRows = rows.slice(startIndex, endIndex);
  
  // Reset to first page when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }
  
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };
  
  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage("");
    }
  };

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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              {/* Page Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, rows.length)} of {rows.length} rows
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">Show:</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Page</span>
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={goToPage || currentPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleGoToPage();
                        }
                      }}
                      onBlur={handleGoToPage}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-gray-500">of {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Simple pagination info for single page */}
          {totalPages <= 1 && rows.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing all {rows.length} rows
            </div>
          )}

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
