
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="sticky top-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <Link to="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-business-blue mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using BizLens
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: December 29, 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using BizLens ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Service Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  BizLens is a comprehensive business management platform designed for Small and Medium Enterprises (SMEs). 
                  Our services include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Sales tracking and inventory management</li>
                  <li>Employee management and role-based access control</li>
                  <li>Financial tracking including expenses, debts, and subscriptions</li>
                  <li>Offline-first functionality with automatic data synchronization</li>
                  <li>Real-time business analytics and reporting</li>
                  <li>Multi-user collaboration tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-business-green" />
                  <span>3. User Accounts and Responsibilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You must provide accurate and complete information when creating an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must be at least 18 years old to create an account</li>
                    <li>One person may not maintain more than one free account</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">User Conduct</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use the service only for legitimate business purposes</li>
                    <li>Do not attempt to gain unauthorized access to other accounts or systems</li>
                    <li>Do not use the service to store or transmit illegal or harmful content</li>
                    <li>Respect intellectual property rights of others</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-business-gold" />
                  <span>4. Subscription and Payment Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subscription Plans</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Free tier available with limited features</li>
                    <li>Paid subscriptions unlock full functionality</li>
                    <li>Billing cycles are monthly or annual as selected</li>
                    <li>Prices are subject to change with 30 days notice</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Payments processed through secure third-party providers</li>
                    <li>M-Pesa, PayPal, and credit card payments accepted</li>
                    <li>Automatic renewal unless cancelled before billing date</li>
                    <li>Refunds processed according to our refund policy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Data Ownership and Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Your Data</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You retain ownership of all business data you input into BizLens</li>
                    <li>We do not claim any ownership rights to your business information</li>
                    <li>You can export your data at any time</li>
                    <li>Data deletion available upon account termination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Our Commitments</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>We will not sell or share your data with third parties</li>
                    <li>Data is encrypted and stored securely</li>
                    <li>Regular backups ensure data availability</li>
                    <li>Compliance with applicable data protection laws</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Service Availability and Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Uptime Commitment</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>We strive for 99.9% uptime availability</li>
                    <li>Scheduled maintenance will be announced in advance</li>
                    <li>Emergency maintenance may occur with limited notice</li>
                    <li>Service credits may apply for extended outages</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Customer Support</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Email support available for all users</li>
                    <li>Priority support for paid subscribers</li>
                    <li>Knowledge base and documentation available</li>
                    <li>Response time: 24-48 hours for standard inquiries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-business-red" />
                  <span>7. Limitations and Disclaimers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Limitations</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>The service is provided "as is" without warranties</li>
                    <li>We do not guarantee uninterrupted or error-free operation</li>
                    <li>Usage limits may apply to prevent system abuse</li>
                    <li>Third-party integrations may have separate terms</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Liability Limitations</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Our liability is limited to the amount paid for the service</li>
                    <li>We are not liable for indirect or consequential damages</li>
                    <li>Users are responsible for data backup and recovery</li>
                    <li>Business decisions remain the user's responsibility</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">By You</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You may cancel your subscription at any time</li>
                    <li>Account deletion available upon request</li>
                    <li>Data export recommended before termination</li>
                    <li>No refunds for partial billing periods</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Us</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>We may terminate accounts for terms violations</li>
                    <li>30 days notice for service discontinuation</li>
                    <li>Immediate termination for serious violations</li>
                    <li>Data retention period: 30 days after termination</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant 
                  changes via email or through the service. Continued use after changes constitutes acceptance 
                  of the new terms. If you disagree with changes, you may terminate your account.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-business-blue" />
                  <span>10. Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> legal@bizlens.com</p>
                    <p><strong>Address:</strong> BizLens Legal Team, Nairobi, Kenya</p>
                    <p><strong>Phone:</strong> +254 700 000 000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-business-green">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-business-green mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-4">
                    By creating an account, you agree to these terms and our privacy policy.
                  </p>
                  <Link to="/auth">
                    <Button className="success-gradient text-white">
                      Create Your Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Logo className="mx-auto mb-4" />
          <p className="text-gray-400">
            &copy; 2024 BizLens. All rights reserved. Empowering African SMEs with smart business tools.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
