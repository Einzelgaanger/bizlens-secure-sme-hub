
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
            <Shield className="h-16 w-16 text-business-blue mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Your privacy and data security are our top priorities
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: December 29, 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-business-blue" />
                  <span>Information We Collect</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Name and email address when you create an account</li>
                    <li>Business information including name, location, and industry</li>
                    <li>Contact information for customer and supplier management</li>
                    <li>Payment information processed securely through third-party providers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Business Data</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Sales transactions, inventory records, and financial data</li>
                    <li>Employee information and role assignments</li>
                    <li>Customer and supplier records</li>
                    <li>Usage analytics to improve our services</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-business-green" />
                  <span>How We Protect Your Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>End-to-end encryption for all data transmission</li>
                    <li>Bank-level security with 256-bit SSL encryption</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Secure data centers with 99.9% uptime guarantee</li>
                    <li>Multi-factor authentication available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Storage</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Data encrypted at rest and in transit</li>
                    <li>Regular automated backups with point-in-time recovery</li>
                    <li>Geographically distributed servers for redundancy</li>
                    <li>Compliance with international data protection standards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-business-gold" />
                  <span>How We Use Your Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and maintain BizLens services</li>
                  <li>Process transactions and manage your business data</li>
                  <li>Send important service updates and notifications</li>
                  <li>Improve our platform based on usage patterns</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-business-red" />
                  <span>Data Sharing and Third Parties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share data only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>With trusted service providers under strict confidentiality agreements</li>
                  <li>To protect the security and integrity of our services</li>
                  <li>In case of business merger or acquisition (with prior notice)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Data Rights</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Access and download your data at any time</li>
                      <li>Correct or update your personal information</li>
                      <li>Delete your account and associated data</li>
                      <li>Opt-out of non-essential communications</li>
                      <li>Data portability to other platforms</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cookie Policy</h4>
                    <p className="text-muted-foreground">
                      We use essential cookies to provide our services and optional cookies to improve your experience. 
                      You can manage cookie preferences in your browser settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offline Data Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    BizLens is designed to work offline for SMEs with limited internet connectivity:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Data is stored locally on your device when offline</li>
                    <li>Local data is encrypted using industry-standard methods</li>
                    <li>Automatic synchronization when internet connection is restored</li>
                    <li>Conflict resolution for data entered by multiple users</li>
                    <li>Local data is purged after successful synchronization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-business-blue" />
                  <span>Contact Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> privacy@bizlens.com</p>
                    <p><strong>Address:</strong> BizLens Privacy Team, Nairobi, Kenya</p>
                    <p><strong>Response Time:</strong> We respond to all privacy inquiries within 48 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-business-blue">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-business-blue mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your Data, Your Control</h3>
                  <p className="text-muted-foreground mb-4">
                    We believe in complete transparency and giving you full control over your business data.
                  </p>
                  <Link to="/auth">
                    <Button className="business-gradient text-white">
                      Get Started Securely
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
