
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset-password') {
      setActiveTab('signin');
      setShowResetForm(true);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setIsLoading(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.email || !signUpData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.firstName,
      signUpData.lastName
    );
    setIsLoading(false);

    if (!error) {
      setActiveTab('signin');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (!error) {
      setShowResetForm(false);
      setResetEmail('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Logo size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Welcome to BizLens</h2>
            <p className="text-gray-600 mt-2">Manage your business like a pro</p>
          </div>

          {/* Auth Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold text-center text-gray-900">
                {showResetForm ? 'Reset Password' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {showResetForm 
                  ? 'Enter your email to receive a password reset link'
                  : 'Sign in to your account or create a new one'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {showResetForm ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetForm(false)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 text-gray-700 border-2 hover:bg-gray-50 font-medium"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                      <TabsTrigger value="signin" className="font-medium">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4 mt-6">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="Enter your email"
                              value={signInData.email}
                              onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={signInData.password}
                              onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-sm text-blue-600 hover:text-blue-500"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-medium"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Signing in...' : 'Sign In'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-6">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="first-name"
                                placeholder="First name"
                                value={signUpData.firstName}
                                onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="last-name"
                                placeholder="Last name"
                                value={signUpData.lastName}
                                onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              value={signUpData.email}
                              onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={signUpData.password}
                              onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirm-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={signUpData.confirmPassword}
                              onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-medium"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating account...' : 'Create Account'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Auth;
