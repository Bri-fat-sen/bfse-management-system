import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
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
              <Shield className="w-7 h-7 text-[#1EB053]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F1F3C]">Privacy Policy</h1>
              <p className="text-gray-500">Last updated: November 2024</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              BFSE Management System ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our business management platform.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect the following types of information:</p>
            
            <h3 className="text-lg font-medium text-[#0F1F3C] mt-6 mb-3">2.1 Account Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Email address for authentication and communication</li>
              <li>Full name for personalisation and identification</li>
              <li>Profile photo (optional)</li>
              <li>Organisation details (company name, address, contact information)</li>
            </ul>

            <h3 className="text-lg font-medium text-[#0F1F3C] mt-6 mb-3">2.2 Business Data</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sales transactions and customer records</li>
              <li>Inventory and product information</li>
              <li>Employee records and HR data</li>
              <li>Financial records and expense reports</li>
              <li>Transport and vehicle management data</li>
            </ul>

            <h3 className="text-lg font-medium text-[#0F1F3C] mt-6 mb-3">2.3 Usage Data</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Log data and access timestamps</li>
              <li>Feature usage patterns</li>
              <li>Device and browser information</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Provide and maintain our business management services</li>
              <li>Process transactions and manage your account</li>
              <li>Send transactional emails (receipts, invoices, notifications)</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (email delivery, cloud hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organisational measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls and role-based permissions</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. 
              You may request deletion of your data at any time, subject to legal retention requirements.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              Our platform may integrate with third-party services. These services have their own privacy 
              policies, and we encourage you to review them. Third-party integrations we may use include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Email delivery services (MailerSend)</li>
              <li>Cloud storage and hosting</li>
              <li>Analytics services</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold text-[#0F1F3C] mt-8 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
            <Link to={createPageUrl("Terms")} className="text-gray-400 hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}