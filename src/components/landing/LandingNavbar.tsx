import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, ArrowRight, Menu, X, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingNavbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/30'
          : 'bg-transparent border-b border-slate-800/40'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Product Label */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  DocCraft
                </span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  AI PLATFORM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-none mt-0.5">
                Multimodal Content Transformation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#inputs-outputs"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Modalities
            </a>
            <a
              href="#showcase"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Showcase
            </a>
            <a
              href="#capabilities"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#security"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Security</span>
            </a>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="glow" size="md" icon={<Sparkles className="h-4 w-4" />}>
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <Button variant="glow" size="md" icon={<ArrowRight className="h-4 w-4" />}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080c14]/98 backdrop-blur-2xl px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 py-1"
            >
              How It Works
            </a>
            <a
              href="#inputs-outputs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 py-1"
            >
              Modalities
            </a>
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 py-1"
            >
              Showcase
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 py-1"
            >
              Capabilities
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 py-1 flex items-center gap-1.5"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Security</span>
            </a>
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" size="md" className="w-full">
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
