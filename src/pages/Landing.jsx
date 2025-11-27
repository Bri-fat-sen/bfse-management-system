import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  BarChart3,
  Shield,
  Clock,
  Globe,
  CheckCircle2,
  ArrowRight,
  Building2,
  DollarSign,
  MessageSquare,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ShoppingCart,
    title: "Point of Sale",
    description: "Complete retail and wholesale sales management with receipt and invoice generation"
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels across warehouses, vehicles, and retail locations in real-time"
  },
  {
    icon: Truck,
    title: "Transport & Fleet",
    description: "Manage vehicles, drivers, routes, trips, and transport contracts efficiently"
  },
  {
    icon: Users,
    title: "HR & Payroll",
    description: "Employee management, attendance tracking, leave requests, and payroll processing"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive business insights with customizable dashboards and reports"
  },
  {
    icon: MessageSquare,
    title: "Team Communication",
    description: "Built-in messaging, announcements, and meeting scheduling for your team"
  }
];

const benefits = [
  "Multi-location inventory tracking",
  "Real-time sales and expense reporting",
  "Employee time and attendance",
  "Customer relationship management",
  "Vehicle and fleet management",
  "Automated stock alerts",
  "Role-based access control",
  "Mobile-friendly interface"
];

export default function Landing() {
  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex flex-col shadow-md">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-[#0F1F3C]">BFSE Management</h1>
                <p className="text-xs text-gray-500">Business Management System</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-[#1EB053] transition-colors">Features</a>
              <a href="#about" className="text-sm text-gray-600 hover:text-[#1EB053] transition-colors">About</a>
              <Link to={createPageUrl("Privacy")} className="text-sm text-gray-600 hover:text-[#1EB053] transition-colors">Privacy Policy</Link>
            </nav>
            <Button onClick={handleLogin} className="bg-[#1EB053] hover:bg-[#178f43]">
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#1EB053] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#0072C6] rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Sierra Leone Flag Stripe */}
            <div className="flex h-2 w-32 rounded-full overflow-hidden mx-auto mb-8">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Complete Business
              <span className="block bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
                Management Solution
              </span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
              An all-in-one platform for managing sales, inventory, transport, HR, and finance. 
              Built for businesses in Sierra Leone and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="bg-[#1EB053] hover:bg-[#178f43] text-lg px-8"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex h-1 w-24 rounded-full overflow-hidden mx-auto mb-6">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F1F3C] mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to manage your operations efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-[#1EB053]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F1F3C] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex h-1 w-24 rounded-full overflow-hidden mb-6">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F1F3C] mb-6">
                Built for Growing Businesses
              </h2>
              <p className="text-gray-600 mb-6">
                BFSE Management System is a comprehensive business management platform designed to help 
                organisations streamline their operations. From small retail shops to large transport 
                companies, our system scales with your needs.
              </p>
              <p className="text-gray-600 mb-8">
                We provide secure, reliable, and easy-to-use tools for managing every aspect of your 
                business, with a focus on the unique needs of businesses operating in Sierra Leone 
                and West Africa.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1EB053] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                    <Building2 className="w-8 h-8 mb-2" />
                    <p className="text-2xl font-bold">Multi-Location</p>
                    <p className="text-sm opacity-80">Support</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                    <Shield className="w-8 h-8 mb-2" />
                    <p className="text-2xl font-bold">Secure</p>
                    <p className="text-sm opacity-80">Data Protection</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                    <Clock className="w-8 h-8 mb-2" />
                    <p className="text-2xl font-bold">Real-Time</p>
                    <p className="text-sm opacity-80">Updates</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                    <Globe className="w-8 h-8 mb-2" />
                    <p className="text-2xl font-bold">Cloud-Based</p>
                    <p className="text-sm opacity-80">Access Anywhere</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Usage Section */}
      <section className="py-16 bg-[#0F1F3C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-12 h-12 text-[#1EB053] mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Your Data, Your Control
          </h2>
          <p className="text-white/80 mb-6">
            We take data privacy seriously. BFSE Management System collects and uses your data solely 
            to provide our business management services. This includes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white font-medium">Account Information</p>
              <p className="text-white/60 text-sm">Email and profile for authentication</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white font-medium">Business Data</p>
              <p className="text-white/60 text-sm">Sales, inventory, and operational data</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white font-medium">Usage Analytics</p>
              <p className="text-white/60 text-sm">To improve our services</p>
            </div>
          </div>
          <Link 
            to={createPageUrl("Privacy")} 
            className="inline-flex items-center text-[#1EB053] hover:text-[#25d366] transition-colors"
          >
            Read our full Privacy Policy
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join businesses across Sierra Leone using BFSE Management System to streamline their operations.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-[#0F1F3C] hover:bg-gray-100 text-lg px-10"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1F3C] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex flex-col">
                  <div className="flex-1 bg-[#1EB053]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#0072C6]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">BFSE Management</h3>
                  <p className="text-xs text-gray-400">Business Management System</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Comprehensive business management platform for sales, inventory, transport, 
                HR, and finance. Built for businesses in Sierra Leone and beyond.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><button onClick={handleLogin} className="hover:text-white transition-colors">Login</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} BFSE Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Proudly serving</span>
              <span className="text-2xl">🇸🇱</span>
              <span className="text-gray-400 text-sm">Sierra Leone</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}