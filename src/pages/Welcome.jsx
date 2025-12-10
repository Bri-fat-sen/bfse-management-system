import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingCart,
  Package,
  Truck,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  ExternalLink
} from "lucide-react";

export default function Welcome() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin(createPageUrl("Welcome"));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Auto-redirect after 5 seconds
  React.useEffect(() => {
    if (!loading && user) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = createPageUrl("Dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, user]);

  const handleContinue = () => {
    window.location.href = createPageUrl("Dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: ShoppingCart, title: "Point of Sale", description: "Complete sales management" },
    { icon: Package, title: "Inventory", description: "Real-time stock tracking" },
    { icon: Truck, title: "Transport", description: "Fleet & logistics management" },
    { icon: Users, title: "HR & Payroll", description: "Employee management" },
    { icon: BarChart3, title: "Analytics", description: "Business insights" },
    { icon: MessageSquare, title: "Communication", description: "Team collaboration" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C]">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1EB053] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0072C6] rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex flex-col shadow-lg">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">BFSE Management</h1>
              <p className="text-xs text-white/60">Business Management System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Sierra Leone Flag Stripe */}
          <div className="flex h-2 w-32 rounded-full overflow-hidden mx-auto mb-8 shadow-lg">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 🎉
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-2">
              You've successfully logged in to BFSE Management System
            </p>
            <p className="text-lg text-white/60">
              Your all-in-one business management platform
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
              >
                <feature.icon className="w-8 h-8 text-[#1EB053] mb-2 mx-auto" />
                <p className="text-white font-medium text-sm mb-1">{feature.title}</p>
                <p className="text-white/60 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Data Privacy Notice */}
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 max-w-2xl">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#1EB053] flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="text-white font-semibold mb-2">Your Data is Secure</h3>
                <p className="text-white/70 text-sm mb-3">
                  We collect and use your information solely to provide business management services. 
                  Your data is encrypted and protected with enterprise-grade security.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link 
                    to={createPageUrl("Privacy")} 
                    className="text-[#1EB053] hover:text-[#25d366] flex items-center gap-1"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-white/40">•</span>
                  <Link 
                    to={createPageUrl("Terms")} 
                    className="text-[#0072C6] hover:text-[#0088e6] flex items-center gap-1"
                  >
                    Terms of Service <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-white/40">•</span>
                  <Link 
                    to={createPageUrl("Landing")} 
                    className="text-white/70 hover:text-white flex items-center gap-1"
                  >
                    Homepage <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button with Countdown */}
          <Button
            size="lg"
            onClick={handleContinue}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 text-white text-lg px-12 py-6 h-auto shadow-xl"
          >
            Continue to App {countdown > 0 && `(${countdown}s)`}
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>

          <p className="text-white/50 text-sm mt-4">
            {countdown > 0 ? `Redirecting in ${countdown} seconds...` : 'Redirecting...'}
          </p>
        </div>

        {/* Footer Links */}
        <footer className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© {new Date().getFullYear()} BFSE Management System</p>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Landing")} className="hover:text-white transition-colors">
                Home
              </Link>
              <span>•</span>
              <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link to={createPageUrl("Support")} className="hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}