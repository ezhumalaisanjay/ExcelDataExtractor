import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToJSON, exportToCSV } from "@/lib/excel-utils";

interface ExportControlsProps {
  data: any[][] | null;
  filename?: string;
  sheetName?: string;
  onClear: () => void;
  disabled: boolean;
}

export function ExportControls({ 
  data, 
  filename, 
  sheetName, 
  onClear, 
  disabled 
}: ExportControlsProps) {
  const { toast } = useToast();

  const handleExport = (format: 'json' | 'csv') => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "Please upload and process a file first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportFilename = `${sheetName || 'data'}.${format}`;
      
      if (format === 'json') {
        exportToJSON(data, exportFilename);
      } else {
        exportToCSV(data, exportFilename);
      }

      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      onClear();
      toast({
        title: "Data cleared",
        description: "All data has been cleared successfully.",
      });
    }
  };

  const totalRows = data ? data.length - 1 : 0;
  const totalColumns = data && data.length > 0 ? data[0].length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={disabled}
          >
            <Download className="mr-2 w-4 h-4" />
            Export as JSON
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={disabled}
          >
            <FileText className="mr-2 w-4 h-4" />
            Export as CSV
          </Button>

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleClear}
            disabled={disabled}
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Clear Data
          </Button>
        </div>

        {!disabled && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
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
        )}
      </CardContent>
    </Card>
  );
}
