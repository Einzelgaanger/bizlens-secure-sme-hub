
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
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineIndicator from '@/components/OfflineIndicator';

const Index = () => {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-business-blue" />,
      title: "Real-time Analytics",
      description: "Track sales, expenses, and profits with live dashboard insights"
    },
    {
      icon: <Users className="h-8 w-8 text-business-green" />,
      title: "Team Management",
      description: "Add employees, assign roles, and monitor business activities remotely"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-business-gold" />,
      title: "Offline First",
      description: "Work without internet - data syncs automatically when connected"
    },
    {
      icon: <Shield className="h-8 w-8 text-business-red" />,
      title: "Bank-level Security",
      description: "Your business data is protected with enterprise-grade encryption"
    },
    {
      icon: <Cloud className="h-8 w-8 text-business-blue" />,
      title: "Cloud Sync",
      description: "Access your business data from anywhere, on any device"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-business-green" />,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <OfflineIndicator />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Reviews</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-business-blue text-business-blue hover:bg-business-blue hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="business-gradient text-white hover:opacity-90 shadow-lg">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Manage Your{' '}
              <span className="bg-gradient-to-r from-business-blue via-business-green to-business-gold bg-clip-text text-transparent">
                SME Business
              </span>
              <br />Like a Pro
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The complete offline-first business management platform designed for African SMEs. 
              Track sales, manage employees, and grow your business - even without internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="business-gradient text-white hover:opacity-90 shadow-xl text-lg px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-business-blue text-business-blue hover:bg-business-blue hover:text-white text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-slide-up">
            <div className="text-center">
              <div className="text-4xl font-bold text-business-blue mb-2">10K+</div>
              <div className="text-muted-foreground">SMEs Trusted Us</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-business-green mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-business-gold mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for small and medium enterprises
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Business Owners</h2>
            <p className="text-xl text-muted-foreground">See what our customers say about BizLens</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-business-gold text-business-gold" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.business}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 business-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of SME owners who trust BizLens to manage and grow their businesses
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-business-blue hover:bg-gray-100 text-lg px-8 py-4 shadow-xl">
              Start Free Trial Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-gray-400">
                Empowering African SMEs with smart business management tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
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
