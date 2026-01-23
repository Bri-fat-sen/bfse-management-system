import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Log to activity log if possible
    try {
      const errorData = {
        action_type: 'error',
        module: 'system',
        description: `UI Error: ${error.message}`,
        old_value: error.stack?.substring(0, 500),
      };
      
      // Only log if we have base44 available
      if (window.base44?.entities?.ActivityLog) {
        window.base44.entities.ActivityLog.create(errorData).catch(console.error);
      }
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <div className="h-2 flex">
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-orange-500" />
            </div>
            
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-3">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                {this.props.fallbackMessage || "An unexpected error occurred. Don't worry, your data is safe. Try refreshing the page."}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs font-mono overflow-auto max-h-64">
                    <p className="text-red-800 font-bold mb-2">{this.state.error.toString()}</p>
                    <pre className="text-red-700 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                
                {this.props.onReset && (
                  <Button
                    onClick={() => {
                      this.setState({ hasError: false, error: null, errorInfo: null });
                      this.props.onReset();
                    }}
                    variant="ghost"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
            
            <div className="h-2 flex">
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-orange-500" />
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;