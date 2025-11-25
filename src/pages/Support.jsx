import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHeader from "@/components/ui/PageHeader";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Send,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";

const faqs = [
  {
    question: "How do I clock in and out?",
    answer: "Navigate to HR & Payroll from the sidebar menu. You'll see a large Clock In/Out card at the top. Simply click the 'Clock In' button when you start work and 'Clock Out' when you finish."
  },
  {
    question: "How do I create a new sale?",
    answer: "Go to Sales & POS from the sidebar. Select your sale type (Retail, Warehouse, or Vehicle), then click on products to add them to your cart. Once done, click Checkout to complete the sale."
  },
  {
    question: "How can I view my attendance history?",
    answer: "Go to My Profile to see your recent attendance records, or visit HR & Payroll and click on the Attendance tab to view detailed records."
  },
  {
    question: "How do I add a new product to inventory?",
    answer: "Navigate to Inventory from the sidebar and click 'Add Product' button. Fill in the product details including name, prices, stock quantity, and save."
  },
  {
    question: "How do I record a trip as a driver?",
    answer: "Go to Transport & Drivers, click 'New Trip', select your assigned vehicle and route, enter the number of passengers, and submit."
  },
  {
    question: "How can I send a message to a colleague?",
    answer: "Navigate to Communication Hub, click the '+' button to start a new chat, select the colleague you want to message, and start typing."
  },
  {
    question: "How do I submit an expense?",
    answer: "Go to Finance, click 'Add Expense', select the category, enter the amount and details, then submit for approval."
  },
  {
    question: "Where can I see all my activities?",
    answer: "The Activity Log page shows a complete history of all your actions in the system. Navigate to it from the sidebar menu."
  }
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "normal"
  });
  const [submitted, setSubmitted] = useState(false);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    // In a real app, this would create a support ticket
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketForm({ subject: "", description: "", priority: "normal" });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Support & Help" 
        subtitle="Get help and find answers to common questions"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1EB053]/70 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">User Guide</h3>
              <p className="text-sm text-gray-500">Learn how to use the system</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1D5FC3] to-[#1D5FC3]/70 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat with support team</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Call Support</h3>
              <p className="text-sm text-gray-500">+232 76 123 4567</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQs */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#1D5FC3]" />
              Frequently Asked Questions
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No matching questions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Ticket */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1EB053]" />
              Submit Support Ticket
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ticket Submitted!</h3>
                <p className="text-gray-500">We'll get back to you within 24 hours</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex gap-2 mt-1">
                    {['low', 'normal', 'high', 'urgent'].map(priority => (
                      <Button
                        key={priority}
                        variant={ticketForm.priority === priority ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTicketForm({ ...ticketForm, priority })}
                        className={ticketForm.priority === priority ? "sl-gradient" : ""}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Please describe your issue in detail..."
                    rows={5}
                  />
                </div>
                <Button 
                  onClick={handleSubmitTicket}
                  disabled={!ticketForm.subject || !ticketForm.description}
                  className="w-full sl-gradient"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Need immediate assistance?</h3>
              <p className="text-gray-500">Our support team is available Monday to Friday, 8AM - 6PM GMT</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#1EB053]" />
                <span className="font-medium">+232 76 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1D5FC3]" />
                <span className="font-medium">support@bfse.sl</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}