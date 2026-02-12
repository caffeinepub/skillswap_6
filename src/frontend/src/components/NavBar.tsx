import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import LoginButton from './Auth/LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useCurrentUser';
import { Menu, X, Video, Upload, User } from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src="/assets/generated/skillswap-logo.dim_512x512.png"
              alt="SkillSwap Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold">SkillSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Home
            </Link>
            <Link
              to="/upload"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Upload
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Profile
            </Link>
          </nav>

          {/* Desktop Auth & Points */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && userProfile && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                <span className="text-lg">⭐</span>
                <span>{userProfile.points.toString()} points</span>
              </div>
            )}
            <LoginButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Video className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/upload"
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
            <div className="flex flex-col space-y-3 pt-3 border-t">
              {isAuthenticated && userProfile && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium">
                  <span className="text-lg">⭐</span>
                  <span>{userProfile.points.toString()} points</span>
                </div>
              )}
              <LoginButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
