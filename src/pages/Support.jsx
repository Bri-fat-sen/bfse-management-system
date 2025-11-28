import React, { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  Phone,
  Mail,
  ChevronRight,
  Search,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";

import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const faqs = [
  {
    question: "How do I clock in/out?",
    answer: "Navigate to the Dashboard and click the 'Clock In' button. When you're done for the day, click 'Clock Out'. Your attendance will be automatically recorded."
  },
  {
    question: "How do I process a sale?",
    answer: "Go to Sales & POS from the sidebar, search or browse products, add them to cart, then click Checkout. Select the payment method and complete the sale."
  },
  {
    question: "How do I view my payroll?",
    answer: "Navigate to HR & Payroll > Payroll tab. You'll see all your payroll records including pending, approved, and paid salaries."
  },
  {
    question: "How do I record a trip (for drivers)?",
    answer: "Go to Transport > Trips, click 'New Trip', select your vehicle and route, enter passenger count and any expenses, then submit."
  },
  {
    question: "How do I start a chat with a colleague?",
    answer: "Go to Communication Hub, click the + button in the chat list, search for the colleague you want to chat with, and start messaging."
  },
  {
    question: "How do I update my profile?",
    answer: "Go to Settings > Profile tab. You can update your phone number, address, and emergency contact information."
  },
  {
    question: "What if I forget my PIN?",
    answer: "Contact your Super Admin to reset your PIN. Only Super Admins have the authority to set or reset employee PINs."
  },
  {
    question: "How do I add an expense?",
    answer: "Go to Finance > Expenses, click 'Add Expense', fill in the details including category, amount, and description, then submit for approval."
  }
];

export default function Support() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our support team will get back to you shortly.",
    });
    e.target.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Help"
        subtitle="Get help and find answers to your questions"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Book, title: "Documentation", description: "Browse guides and tutorials", color: "from-[#1EB053] to-emerald-600" },
          { icon: Video, title: "Video Tutorials", description: "Watch how-to videos", color: "from-[#1D5FC3] to-blue-600" },
          { icon: MessageSquare, title: "Live Chat", description: "Chat with support team", color: "from-purple-500 to-purple-600" },
        ].map((item) => (
          <Card key={item.title} className="cursor-pointer hover:shadow-lg transition-shadow group">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <p className="text-center text-gray-500 py-4">No FAQs match your search</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input name="subject" required className="mt-1" placeholder="What do you need help with?" />
              </div>
              <div>
                <Label>Category</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option>General Question</option>
                  <option>Technical Issue</option>
                  <option>Feature Request</option>
                  <option>Billing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea 
                  name="message" 
                  required 
                  className="mt-1" 
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e]">
                Send Message
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 mb-4">Or reach us directly:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-[#1D5FC3]" />
                  <span>+232 XX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[#1D5FC3]" />
                  <span>support@bfse.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold">Dec 2024</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Platform</p>
              <p className="font-semibold">Base44</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-green-600">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}