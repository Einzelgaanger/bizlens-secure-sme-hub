
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Shield, 
  Smartphone, 
  Cloud,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useState } from 'react';

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Real-time Analytics",
      description: "Track sales, expenses, and profits with live dashboard insights"
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Team Management",
      description: "Add employees, assign roles, and monitor business activities remotely"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-purple-600" />,
      title: "Offline First",
      description: "Work without internet - data syncs automatically when connected"
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: "Bank-level Security",
      description: "Your business data is protected with enterprise-grade encryption"
    },
    {
      icon: <Cloud className="h-6 w-6 text-blue-600" />,
      title: "Cloud Sync",
      description: "Access your business data from anywhere, on any device"
    },
    {
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      title: "Financial Tracking",
      description: "Monitor cash flow, debts, and subscription payments seamlessly"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mwangi",
      business: "Nairobi Fashion Store",
      rating: 5,
      text: "BizLens transformed how I manage my boutique. Even when internet is slow, I can track everything offline!"
    },
    {
      name: "John Kamau",
      business: "Tech Solutions Ltd",
      rating: 5,
      text: "Managing 15 employees across 3 locations became effortless. The real-time insights are game-changing."
    },
    {
      name: "Grace Ochieng",
      business: "Fresh Produce Market",
      rating: 5,
      text: "The debt tracking feature helped me recover over KSh 200,000 in outstanding payments."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <OfflineIndicator />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Privacy</Link>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Features</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Reviews</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
                <Link to="/privacy" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Privacy</Link>
                <div className="flex flex-col space-y-2 px-3 pt-4">
                  <Link to="/auth">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Background */}
      <section className="relative bg-slate-50 py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Manage Your{' '}
              <span className="text-blue-600">SME Business</span>
              <br />Like a Pro
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              The complete offline-first business management platform designed for African SMEs. 
              Track sales, manage employees, and grow your business - even without internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">SMEs Trusted Us</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything Your Business Needs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for small and medium enterprises
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200">
                <CardHeader className="pb-4">
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg w-fit">{feature.icon}</div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by Business Owners</h2>
            <p className="text-xl text-gray-600">See what our customers say about BizLens</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">{testimonial.name}</CardTitle>
                  <CardDescription className="text-gray-600">{testimonial.business}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="italic text-gray-700">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of SME owners who trust BizLens to manage and grow their businesses
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-xl">
              Start Free Trial Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Logo className="mb-4" />
              <p className="text-gray-400">
                Empowering African SMEs with smart business management tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BizLens. All rights reserved. Built with ❤️ for African entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
