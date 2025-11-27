import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex flex-col shadow-md">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-[#0F1F3C]">BFSE Management</h1>
              </div>
            </Link>
            <Link to={createPageUrl("Landing")}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#0072C6]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F1F3C]">Terms of Service</h1>
              <p className="text-gray-500">Last updated: November 2024</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using BFSE Management System ("the Service"), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              BFSE Management System is a cloud-based business management platform that provides tools for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Point of sale and sales management</li>
              <li>Inventory and stock tracking</li>
              <li>Transport and fleet management</li>
              <li>Human resources and payroll</li>
              <li>Financial reporting and analytics</li>
              <li>Customer relationship management</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To use the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorised use</li>
              <li>Providing accurate and current account information</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">5. Data Ownership</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of all data you input into the Service. We do not claim any ownership 
              rights over your business data. You grant us a limited license to use your data solely to 
              provide and improve the Service.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">6. Service Availability</h2>
            <p className="text-gray-600 mb-4">
              We strive to maintain high availability of the Service but do not guarantee uninterrupted 
              access. We may perform maintenance or updates that temporarily affect availability.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use of the Service.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">8. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may suspend or terminate your access to the Service at any time for violation of these 
              terms or for any other reason. Upon termination, your right to use the Service will cease 
              immediately.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These terms shall be governed by and construed in accordance with the laws of Sierra Leone.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">11. Contact</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 border">
              <p className="text-gray-700 font-medium">BFSE Management System</p>
              <p className="text-gray-600">Freetown, Sierra Leone</p>
              <p className="text-gray-600">Email: support@bfse-management.com</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F1F3C] text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BFSE Management System. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <Link to={createPageUrl("Landing")} className="text-gray-400 hover:text-white">Home</Link>
            <span className="text-gray-600">•</span>
            <Link to={createPageUrl("Privacy")} className="text-gray-400 hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}