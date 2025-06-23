import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Download } from "lucide-react";

interface DataIssue {
  rowIndex: number;
  columnIndex: number;
  columnName: string;
  issueType: 'empty' | 'invalid_format' | 'outlier' | 'duplicate';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedFix: string;
}

interface DataQualityCheckerProps {
  data: any[][] | null;
  currentSheet: string;
}

export function DataQualityChecker({ data, currentSheet }: DataQualityCheckerProps) {
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const issues = useMemo(() => {
    if (!data || data.length === 0) return [];

    const headers = data[0] || [];
    const rows = data.slice(1);
    const foundIssues: DataIssue[] = [];
    const seenValues = new Map<number, Set<string>>();

    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const columnName = headers[colIndex] || `Column ${colIndex + 1}`;
        const cellValue = String(cell || '').trim();

        // Initialize seen values for this column
        if (!seenValues.has(colIndex)) {
          seenValues.set(colIndex, new Set());
        }

        // Check for empty cells
        if (!cellValue) {
          foundIssues.push({
            rowIndex: rowIndex + 2, // +2 because we start from 1 and skip header
            columnIndex: colIndex,
            columnName,
            issueType: 'empty',
            severity: 'medium',
            description: 'Empty cell detected',
            suggestedFix: 'Fill with appropriate value or mark as N/A'
          });
        }

        // Check for duplicates within column
        const columnValues = seenValues.get(colIndex)!;
        if (cellValue && columnValues.has(cellValue)) {
          foundIssues.push({
            rowIndex: rowIndex + 2,
            columnIndex: colIndex,
            columnName,
            issueType: 'duplicate',
            severity: 'low',
            description: `Duplicate value: "${cellValue}"`,
            suggestedFix: 'Review if duplicate is intentional or needs correction'
          });
        } else if (cellValue) {
          columnValues.add(cellValue);
        }

        // Check for format issues (email, phone, date patterns)
        if (cellValue) {
          // Email format check
          if (columnName.toLowerCase().includes('email') && !isValidEmail(cellValue)) {
            foundIssues.push({
              rowIndex: rowIndex + 2,
              columnIndex: colIndex,
              columnName,
              issueType: 'invalid_format',
              severity: 'high',
              description: 'Invalid email format',
              suggestedFix: 'Correct email format (example@domain.com)'
            });
          }

          // Numeric outlier check for numeric columns
          if (isNumeric(cellValue)) {
            const numValue = parseFloat(cellValue);
            if (numValue < 0 && columnName.toLowerCase().includes('age')) {
              foundIssues.push({
                rowIndex: rowIndex + 2,
                columnIndex: colIndex,
                columnName,
                issueType: 'outlier',
                severity: 'high',
                description: 'Negative age value',
                suggestedFix: 'Verify age value is correct'
              });
            }
          }
        }
      });
    });

    return foundIssues;
  }, [data]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const severityMatch = filterSeverity === 'all' || issue.severity === filterSeverity;
      const typeMatch = filterType === 'all' || issue.issueType === filterType;
      return severityMatch && typeMatch;
    });
  }, [issues, filterSeverity, filterType]);

  const handleIssueToggle = (issueId: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map((_, index) => `${index}`)));
    }
  };

  const exportSelectedIssues = () => {
    const selectedData = filteredIssues.filter((_, index) => 
      selectedIssues.has(`${index}`)
    );

    const csvContent = [
      ['Row', 'Column', 'Issue Type', 'Severity', 'Description', 'Suggested Fix'],
      ...selectedData.map(issue => [
        issue.rowIndex,
        issue.columnName,
        issue.issueType,
        issue.severity,
        issue.description,
        issue.suggestedFix
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_quality_issues_${currentSheet}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIssueIcon = (issueType: string) => {
    switch (issueType) {
      case 'empty': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'invalid_format': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'outlier': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'duplicate': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Data Quality Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Upload data to check for quality issues
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Data Quality Issues</span>
            <Badge variant="outline">{filteredIssues.length} issues found</Badge>
          </CardTitle>
          {selectedIssues.size > 0 && (
            <Button
              onClick={exportSelectedIssues}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export Selected</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex space-x-4">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Issue Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="empty">Empty Values</SelectItem>
              <SelectItem value="invalid_format">Invalid Format</SelectItem>
              <SelectItem value="outlier">Outliers</SelectItem>
              <SelectItem value="duplicate">Duplicates</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSelectAll}
            variant="outline"
            size="sm"
          >
            {selectedIssues.size === filteredIssues.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Issues Table */}
        {filteredIssues.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIssues.size === filteredIssues.length && filteredIssues.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Suggested Fix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue, index) => {
                  const issueId = `${index}`;
                  return (
                    <TableRow key={issueId} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIssues.has(issueId)}
                          onCheckedChange={() => handleIssueToggle(issueId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{issue.rowIndex}</TableCell>
                      <TableCell>{issue.columnName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getIssueIcon(issue.issueType)}
                          <span className="capitalize">{issue.issueType.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{issue.description}</TableCell>
                      <TableCell className="text-sm text-gray-600">{issue.suggestedFix}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">No data quality issues found!</p>
            <p className="text-gray-500 text-sm">Your data appears to be clean and well-formatted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}