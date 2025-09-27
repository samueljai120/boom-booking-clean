import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Quote,
  Award,
  Globe,
  X,
  Maximize2,
  MousePointer,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    venues: 0,
    revenue: 0
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const testimonialIntervalRef = useRef(null);
  const { login } = useAuth();

  // Demo login function - same as LoginPage
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting demo login...');
      toast.loading('Logging into demo account...', { id: 'demo-login' });
      
      const result = await login({
        email: 'demo@example.com',
        password: 'demo123'
      });
      console.log('📋 Demo login result:', result);
      
      if (result.success) {
        toast.success('Demo login successful! Redirecting to dashboard...', { id: 'demo-login' });
        // AuthContext will handle subdomain redirect automatically
        // No need to navigate manually here
      } else {
        console.error('❌ Demo login failed:', result.error);
        toast.error(result.error || 'Demo login failed. Please try again.', { id: 'demo-login' });
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      toast.error('Demo login error: ' + error.message, { id: 'demo-login' });
    } finally {
      setLoading(false);
    }
  };
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Downtown Karaoke",
      avatar: "SC",
      avatarColor: "from-pink-400 to-rose-500",
      venue: "Downtown Karaoke",
      venueImage: "🎤",
      content: "Boom Booking transformed our business. We've seen a 40% increase in bookings and our staff efficiency has improved dramatically. The automated reminders alone saved us 15 hours per week.",
      rating: 5,
      verified: true,
      metrics: "40% increase in bookings",
      industry: "Entertainment"
    },
    {
      name: "Mike Rodriguez",
      role: "Manager, Premium Lounge",
      avatar: "MR",
      avatarColor: "from-blue-400 to-indigo-500",
      venue: "Premium Lounge",
      venueImage: "🍸",
      content: "The mobile interface is incredible. Our staff can manage bookings from anywhere, and customers love the seamless experience. Revenue increased by 35% in just 3 months.",
      rating: 5,
      verified: true,
      metrics: "35% revenue increase",
      industry: "Hospitality"
    },
    {
      name: "Emma Thompson",
      role: "Director, Chain Operations",
      avatar: "ET",
      avatarColor: "from-purple-400 to-violet-500",
      venue: "Chain Operations",
      venueImage: "🏢",
      content: "Finally, a booking system that scales with our business. The multi-location features are exactly what we needed. We've reduced no-shows by 60%.",
      rating: 5,
      verified: true,
      metrics: "60% reduction in no-shows",
      industry: "Multi-location"
    },
    {
      name: "David Kim",
      role: "Operations Manager, City Events",
      avatar: "DK",
      avatarColor: "from-green-400 to-emerald-500",
      venue: "City Events",
      venueImage: "🎉",
      content: "The analytics dashboard gives us insights we never had before. We can now predict peak times and optimize our pricing. Customer satisfaction is at 98%.",
      rating: 5,
      verified: true,
      metrics: "98% customer satisfaction",
      industry: "Events"
    },
    {
      name: "Lisa Wang",
      role: "Founder, Cozy Cafe",
      avatar: "LW",
      avatarColor: "from-orange-400 to-red-500",
      venue: "Cozy Cafe",
      venueImage: "☕",
      content: "As a small business owner, I needed something simple yet powerful. Boom Booking delivered exactly that. Our booking conversion rate improved by 45%.",
      rating: 5,
      verified: true,
      metrics: "45% better conversion",
      industry: "Small Business"
    }
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const slideInLeft = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const slideInRight = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const targetStats = { bookings: 12500, venues: 150, revenue: 2.4 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          bookings: Math.floor(targetStats.bookings * progress),
          venues: Math.floor(targetStats.venues * progress),
          revenue: (targetStats.revenue * progress).toFixed(1)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    animateStats();
    
    // Initialize component after a short delay to prevent first-click issues
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
      console.log('🎯 Landing page initialized - demo buttons ready');
    }, 500);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, []);

  // Testimonial carousel functions
  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index) => {
    setCurrentTestimonial(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      testimonialIntervalRef.current = setInterval(nextTestimonial, 5000);
    } else {
      clearInterval(testimonialIntervalRef.current);
    }

    return () => clearInterval(testimonialIntervalRef.current);
  }, [isAutoPlaying, nextTestimonial]);


  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Booking System",
      description: "Intuitive calendar interface with real-time availability and conflict detection.",
      color: "from-blue-500 to-blue-600",
      demo: "calendar"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-User Management",
      description: "Role-based access control for staff, managers, and administrators.",
      color: "from-green-500 to-green-600",
      demo: "users"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices and screen sizes.",
      color: "from-purple-500 to-purple-600",
      demo: "mobile"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Reports",
      description: "Comprehensive insights into booking patterns and revenue optimization.",
      color: "from-orange-500 to-orange-600",
      demo: "analytics"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with data encryption and secure authentication.",
      color: "from-red-500 to-red-600",
      demo: "security"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized performance with sub-second response times and real-time updates.",
      color: "from-yellow-500 to-yellow-600",
      demo: "performance"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: ["1 Room", "50 Bookings/Month", "Basic Support", "Mobile App"],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Basic",
      price: "$19",
      period: "per month",
      description: "For growing businesses",
      features: ["5 Rooms", "500 Bookings/Month", "Email Support", "Analytics", "Calendar Sync"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For established venues",
      features: ["20 Rooms", "2,000 Bookings/Month", "Priority Support", "API Access", "Custom Branding", "Advanced Analytics"],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$99",
      period: "per month",
      description: "For multi-location chains",
      features: ["Unlimited Rooms", "Unlimited Bookings", "White-label", "Dedicated Support", "Multi-location Management"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="scroll-indicator"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-100 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-green-100 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Calendar className="w-5 h-5 text-white" />
              </motion.div>
              <span className="ml-2 text-xl font-bold text-gray-900">Boom Booking</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#pricing" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Pricing
              </motion.a>
              <motion.a 
                href="#testimonials" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Reviews
              </motion.a>
              <motion.button
                onClick={handleDemoLogin}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center disabled:opacity-50"
                whileHover={{ y: -2 }}
              >
                <Play className="w-4 h-4 mr-1" />
                {loading ? 'Logging in...' : 'Live Demo'}
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <header className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-2 mb-6 inline-flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-4 h-4 mr-2" />
                </motion.div>
                #1 Karaoke Booking Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Book More, 
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Stress Less
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The smartest booking system for karaoke venues. Increase revenue by 40% with our AI-powered scheduling and customer management platform.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg">
                  <Link to="/register" className="flex items-center">
                    Start Free Trial
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 border-2 hover:bg-gray-50 disabled:opacity-50"
                  disabled={loading}
                  onClick={handleDemoLogin}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                  </motion.div>
                  {loading ? 'Logging in...' : 'Watch Live Demo'}
                </Button>
              </motion.div>
            </motion.div>

            {/* Animated Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  {stats.bookings.toLocaleString()}+
                </motion.div>
                <div className="text-gray-600 font-medium">Bookings Managed</div>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {stats.venues}+
                </motion.div>
                <div className="text-gray-600 font-medium">Happy Venues</div>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  ${stats.revenue}M+
                </motion.div>
                <div className="text-gray-600 font-medium">Revenue Generated</div>
              </motion.div>
            </motion.div>
            </header>

            {/* Right Column - Product Mockup */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <motion.div 
                  className="relative bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">Boom Booking</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mockup Calendar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Today's Bookings</h3>
                      <span className="text-sm text-blue-600 font-medium">Dec 2024</span>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-gray-500 py-2">{day}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <motion.div 
                          key={day}
                          className={`text-center py-2 rounded-lg cursor-pointer ${
                            day === 15 ? 'bg-blue-600 text-white' : 
                            day > 15 && day < 20 ? 'bg-blue-100 text-blue-600' : 
                            'text-gray-700 hover:bg-gray-100'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {day}
                        </motion.div>
                      ))}
                    </div>

                    {/* Booking Cards */}
                    <div className="space-y-2">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Room A - 2:00 PM</p>
                            <p className="text-xs text-gray-600">John Smith - 2 hours</p>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Room B - 4:00 PM</p>
                            <p className="text-xs text-gray-600">Sarah Chen - 1.5 hours</p>
                          </div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">+12 Bookings</p>
                      <p className="text-xs text-gray-500">This week</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">+40% Revenue</p>
                      <p className="text-xs text-gray-500">vs last month</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modern Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Floating elements */}
          <motion.div
            className="absolute top-20 right-20 w-4 h-4 bg-blue-400/20 rounded-full"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-6 h-6 bg-purple-400/20 rounded-full"
            animate={{ y: [0, 20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 text-blue-800 text-sm font-semibold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
              Powerful Features
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Everything You Need to Succeed
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Streamline your venue operations with our comprehensive suite of tools designed for modern entertainment businesses
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Feature 1: Smart Booking */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Booking System</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Real-time availability tracking with intelligent conflict detection. Reduce double-bookings by 95% and increase revenue with dynamic pricing.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Real-time availability updates
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Automated conflict detection
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Dynamic pricing optimization
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Analytics Dashboard */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get deep insights into your business performance. Track revenue trends, customer behavior, and optimize your operations with data-driven decisions.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Revenue tracking & forecasting
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Customer behavior insights
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Performance optimization
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Team Management */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Role-based access control with seamless team coordination. Manage staff schedules, permissions, and communication all in one place.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Role-based permissions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Staff scheduling tools
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Real-time communication
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Mobile Access */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile-First Design</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access your venue management system from anywhere. Responsive design that works perfectly on all devices with offline capabilities.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Responsive design
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Offline mode support
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Touch-optimized interface
                </div>
              </div>
            </motion.div>

            {/* Feature 5: Security & Compliance */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bank-level security with end-to-end encryption, secure authentication, and compliance with industry standards. Your data is always protected.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  End-to-end encryption
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  SOC 2 compliance
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Secure authentication
                </div>
              </div>
            </motion.div>

            {/* Feature 6: Performance & Reliability */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Optimized for speed with sub-second response times and 99.9% uptime guarantee. Your business never stops, and neither do we.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Sub-second response times
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  99.9% uptime guarantee
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Real-time synchronization
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard" className="flex items-center">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.button>
            
            <p className="text-gray-600 mt-4 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Web App Dashboard Preview Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Modern Multi-Layer Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60" />
          
          {/* Secondary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/40 to-transparent" />
          
          {/* Animated gradient orbs with enhanced effects */}
          <motion.div
            className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/15 to-indigo-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-indigo-400/20 via-pink-400/15 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          
          {/* Glassmorphism floating elements */}
          <motion.div
            className="absolute top-20 right-20 w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg"
            animate={{ 
              rotate: [0, 360],
              y: [0, -20, 0],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          <motion.div
            className="absolute bottom-32 left-16 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-full border border-white/30"
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.4, 0.8, 0.4],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Enhanced floating particles with glassmorphism */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -150, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                x: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                delay: Math.random() * 15,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Glassmorphism content container */}
          <div className="relative">
            {/* Background glass effect */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl" />
            
            {/* Content wrapper */}
            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Column - Enhanced Text */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  {/* Enhanced Badge with glassmorphism */}
                  <motion.div
                    className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-blue-800 text-sm font-semibold mb-8 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
                    Live Web Dashboard
                  </motion.div>

                  <motion.h2 
                    className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-8 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    Powerful Web Dashboard
                  </motion.h2>
              
                  <motion.p 
                    className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    Access your complete booking management system from any device. Our responsive web dashboard gives you real-time insights and full control over your venue operations.
                  </motion.p>
              
                  {/* Enhanced Feature List with glassmorphism */}
                  <motion.div 
                    className="space-y-6 mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {[
                      { icon: CheckCircle, text: "Real-time booking management", color: "green" },
                      { icon: Shield, text: "Secure multi-tenant architecture", color: "blue" },
                      { icon: Zap, text: "Instant notifications & updates", color: "purple" },
                      { icon: BarChart3, text: "Live analytics & reporting", color: "indigo" },
                      { icon: Users, text: "Team collaboration tools", color: "pink" }
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center group p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 8, scale: 1.02 }}
                      >
                        <motion.div 
                          className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                        </motion.div>
                        <span className="text-gray-800 text-lg font-semibold group-hover:text-gray-900 transition-colors">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Enhanced Statistics with glassmorphism */}
                  <motion.div 
                    className="grid grid-cols-3 gap-6 mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    {[
                      { number: "99.9%", label: "Uptime" },
                      { number: "<2s", label: "Load Time" },
                      { number: "24/7", label: "Support" }
                    ].map((stat, index) => (
                      <motion.div 
                        key={index}
                        className="text-center p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg"
                        whileHover={{ scale: 1.05, y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                        <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Call to Action */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/dashboard" className="flex items-center">
                        Access Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </motion.button>
                    
                    <motion.button
                      className="flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg text-lg font-semibold"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </motion.button>
                  </motion.div>

                  {/* Coming Soon Notice */}
                  <motion.div 
                    className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Mobile App Coming Soon</div>
                        <div className="text-sm text-gray-600">Native iOS & Android apps in development</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column - Dashboard Preview */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Enhanced floating elements around dashboard */}
                  <motion.div
                    className="absolute -top-8 -left-8 w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg border border-white/20"
                    animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -right-8 w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full shadow-lg border border-white/20"
                    animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  {/* Dashboard Mockup */}
                  <motion.div 
                    className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Browser Header */}
                    <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-500 ml-4">
                        boom-booking.com/dashboard
                      </div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                          <p className="text-gray-600">Welcome back, Sarah!</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">S</span>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                          { label: "Today's Bookings", value: "12", color: "blue" },
                          { label: "Revenue", value: "$2,400", color: "green" },
                          { label: "Occupancy", value: "85%", color: "purple" },
                          { label: "Satisfaction", value: "4.8★", color: "yellow" }
                        ].map((stat, index) => (
                          <motion.div 
                            key={index}
                            className={`p-4 bg-${stat.color}-50 rounded-xl border-l-4 border-${stat.color}-400`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Recent Bookings */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Recent Bookings</h4>
                        <div className="space-y-2">
                          {[
                            { room: "Room A", time: "2:00 PM", customer: "John Smith", status: "confirmed" },
                            { room: "Room B", time: "4:00 PM", customer: "Sarah Chen", status: "pending" },
                            { room: "Room C", time: "6:30 PM", customer: "Mike Johnson", status: "confirmed" }
                          ].map((booking, index) => (
                            <motion.div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              <div>
                                <div className="font-medium text-gray-900">{booking.room} - {booking.time}</div>
                                <div className="text-sm text-gray-600">{booking.customer}</div>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced floating action button */}
                  <motion.div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                    animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof & Success Metrics */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Floating elements */}
          <motion.div
            className="absolute top-20 right-20 w-4 h-4 bg-blue-400/20 rounded-full"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-6 h-6 bg-purple-400/20 rounded-full"
            animate={{ y: [0, 20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 text-blue-800 text-sm font-semibold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
              Trusted by 10,000+ Venues
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join the Success Stories
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              See how venues worldwide are transforming their business with our platform
            </motion.p>
          </motion.div>

          {/* Success Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {[
              { 
                number: "10,000+", 
                label: "Active Venues", 
                icon: "🏢",
                color: "from-blue-500 to-indigo-600",
                description: "Worldwide"
              },
              { 
                number: "$2.4M", 
                label: "Revenue Generated", 
                icon: "💰",
                color: "from-green-500 to-emerald-600",
                description: "For our customers"
              },
              { 
                number: "98%", 
                label: "Customer Satisfaction", 
                icon: "⭐",
                color: "from-yellow-500 to-orange-600",
                description: "Average rating"
              },
              { 
                number: "40%", 
                label: "Revenue Increase", 
                icon: "📈",
                color: "from-purple-500 to-pink-600",
                description: "Average boost"
              }
            ].map((metric, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center text-2xl shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {metric.icon}
                </motion.div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{metric.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{metric.label}</div>
                <div className="text-sm text-gray-500">{metric.description}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Customer Logos & Testimonials */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Left: Customer Logos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center lg:text-left">
                Trusted by Industry Leaders
              </h3>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { name: "Karaoke Central", location: "Tokyo, Japan", logo: "🎤", revenue: "+45%" },
                  { name: "Voice Box Lounge", location: "Seoul, Korea", logo: "🎵", revenue: "+38%" },
                  { name: "Melody Bar", location: "Bangkok, Thailand", logo: "🎶", revenue: "+52%" },
                  { name: "Harmony Club", location: "Singapore", logo: "🎼", revenue: "+41%" }
                ].map((customer, index) => (
                  <motion.div 
                    key={index}
                    className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl mr-4">
                        {customer.logo}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{customer.revenue}</div>
                      <div className="text-xs text-gray-500">Revenue Increase</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Featured Testimonial */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <div className="relative p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    🎤
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Owner, Karaoke Central Tokyo</div>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                  "Boom Booking transformed our venue completely. We've seen a 45% increase in revenue and our customers love the seamless booking experience. The real-time analytics help us make data-driven decisions every day."
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Verified customer since 2023
                  </div>
                  <motion.button
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Read More Stories
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Success Story Today
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Modern Testimonials & Reviews Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Floating elements */}
          <motion.div
            className="absolute top-20 right-20 w-4 h-4 bg-blue-400/20 rounded-full"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-6 h-6 bg-purple-400/20 rounded-full"
            animate={{ y: [0, 20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 text-blue-800 text-sm font-semibold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
              Trusted by 10,000+ Venues
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Loved by Venue Owners Worldwide
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              See how Boom Booking is transforming venue management with real results from real customers
            </motion.p>
          </motion.div>

          {/* Overall Rating */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-white/50">
              <div className="text-6xl font-bold text-gray-900 mr-4">4.9</div>
              <div className="text-left">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-gray-600 text-sm">Based on 2,847 reviews</div>
                <div className="text-gray-500 text-xs">Trustpilot, Google Reviews, Capterra</div>
              </div>
            </div>
          </motion.div>

          {/* Featured Testimonials Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Testimonial 1 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-500">2 days ago</span>
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "Boom Booking completely transformed our karaoke venue. We've seen a 45% increase in bookings and our staff efficiency has improved dramatically. The automated reminders alone saved us 15 hours per week."
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">SC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Owner, Karaoke Central Tokyo</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">+45%</div>
                  <div className="text-xs text-gray-500">Bookings</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-500">1 week ago</span>
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "The analytics dashboard gives us insights we never had before. We can now predict peak times and optimize our pricing. Customer satisfaction is at 98% and revenue increased by 35%."
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike Rodriguez</div>
                    <div className="text-sm text-gray-600">Manager, Premium Lounge</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">+35%</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-500">3 days ago</span>
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "Finally, a booking system that scales with our business. The multi-location features are exactly what we needed. We've reduced no-shows by 60% and our team loves the interface."
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">ET</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Emma Thompson</div>
                    <div className="text-sm text-gray-600">Director, Chain Operations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">-60%</div>
                  <div className="text-xs text-gray-500">No-shows</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Video Testimonial Section */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-6">
                    Watch How We Transformed This Venue
                  </h3>
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    See how Karaoke Central Tokyo increased their bookings by 45% and improved customer satisfaction to 98% using Boom Booking.
                  </p>
                  
                  <div className="flex items-center space-x-6">
                    <motion.button
                      className="flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Video
                    </motion.button>
                    
                    <div className="text-sm text-blue-100">
                      <div className="font-semibold">2:34 min</div>
                      <div>Customer Success Story</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <motion.div
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Video Stats Overlay */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">45%</div>
                      <div className="text-sm text-gray-600">Increase in Bookings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Review Platforms */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Rated Excellent on All Platforms</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { platform: "Trustpilot", rating: "4.9", reviews: "1,247 reviews", color: "from-green-400 to-emerald-500" },
                { platform: "Google Reviews", rating: "4.8", reviews: "892 reviews", color: "from-blue-400 to-indigo-500" },
                { platform: "Capterra", rating: "4.9", reviews: "708 reviews", color: "from-purple-400 to-violet-500" }
              ].map((platform, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white font-bold text-xl">{platform.platform[0]}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{platform.rating}</div>
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">{platform.reviews}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Choose the perfect plan for your venue. No hidden fees, no surprises.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className={`p-6 relative hover:shadow-2xl transition-all duration-300 pricing-card ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-white' 
                    : 'bg-white hover:from-gray-50 hover:to-white'
                }`}>
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 animate-pulse-glow">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </motion.div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {plan.name}
                    </h3>
                    <motion.div 
                      className="text-4xl font-bold text-gray-900 mb-1"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {plan.price}
                    </motion.div>
                    <div className="text-gray-600">{plan.period}</div>
                    <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        </motion.div>
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className={`w-full btn-animated ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-transparent to-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          
          {/* Floating elements */}
          <motion.div
            className="absolute top-20 right-20 w-4 h-4 bg-white/30 rounded-full"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-6 h-6 bg-white/20 rounded-full"
            animate={{ y: [0, 20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* Urgency Badge */}
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
              Limited Time: 50% Off First 3 Months
            </motion.div>
            
            {/* Main Headline */}
            <motion.h2 
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Start Your Success Story Today
            </motion.h2>
            
            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join 10,000+ venues already using Boom Booking to increase revenue by 40% and reduce no-shows by 60%
            </motion.p>
          </div>

          {/* Value Proposition Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Value 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">40%</div>
              <div className="text-blue-100 text-sm">Average Revenue Increase</div>
            </div>
            
            {/* Value 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">60%</div>
              <div className="text-blue-100 text-sm">Reduction in No-shows</div>
            </div>
            
            {/* Value 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">15hrs</div>
              <div className="text-blue-100 text-sm">Saved Per Week</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Primary CTA */}
            <motion.button
              className="px-12 py-6 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl text-xl font-bold flex items-center group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="flex items-center">
                Start Your Free Trial
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Link>
            </motion.button>
            
            {/* Secondary CTA */}
            <motion.button
              className="px-12 py-6 bg-transparent border-2 border-white text-white rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-xl text-xl font-semibold flex items-center"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/pricing" className="flex items-center">
                View Pricing Plans
                <TrendingUp className="w-6 h-6 ml-3" />
              </Link>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100 text-sm">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>10,000+ happy customers</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Boom Booking</span>
              </div>
              <p className="text-gray-400">
                The smartest booking system for karaoke venues and entertainment businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Demo</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/status" className="hover:text-white">Status</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Boom Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
