import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Brain, TrendingUp, Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIInsights {
  summary: string;
  patterns: string[];
  suggestions: string[];
}

interface AIInsightsProps {
  fileId: number | null;
  currentSheet: string;
  initialInsights?: AIInsights | null;
}

export function AIInsights({ fileId, currentSheet, initialInsights }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(initialInsights || null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    if (!fileId) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/files/${fileId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetName: currentSheet }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      const data = await response.json();
      setDetailedAnalysis(data.analysis);
      
      toast({
        title: "AI Analysis Complete",
        description: "Detailed insights have been generated for your data.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!fileId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-purple-600 w-8 h-8" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Analysis</h4>
            <p className="text-gray-500">Upload an Excel file to get intelligent insights about your data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Insights</span>
            <Badge variant="secondary" className="ml-2">Powered by Gemini</Badge>
          </CardTitle>
          <Button
            onClick={handleGenerateInsights}
            disabled={isAnalyzing}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                Detailed Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Insights */}
        {insights && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Summary
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {insights.summary}
              </p>
            </div>

            {insights.patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-1" />
                  Key Patterns
                </h4>
                <div className="space-y-2">
                  {insights.patterns.map((pattern, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Suggestions
                </h4>
                <div className="space-y-2">
                  {insights.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-green-50 p-2 rounded border-l-2 border-green-400">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Analysis */}
        {detailedAnalysis && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Detailed Analysis
            </h4>
            <div className="text-sm text-gray-700 bg-purple-50 p-4 rounded-lg border border-purple-200 whitespace-pre-wrap">
              {detailedAnalysis}
            </div>
          </div>
        )}

        {/* No insights yet */}
        {!insights && !detailedAnalysis && (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Click "Detailed Analysis" to get AI-powered insights about your data patterns, quality, and suggestions for improvement.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}