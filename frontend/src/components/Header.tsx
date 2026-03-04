import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, Globe, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const navLinks = [
    { to: '/', label: t('Home', 'होम') },
    { to: '/about', label: t('About Us', 'हमारे बारे में') },
    { to: '/projects', label: t('Projects', 'परियोजनाएं') },
    { to: '/gallery', label: t('Gallery', 'गैलरी') },
    { to: '/contact', label: t('Contact', 'संपर्क करें') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          {!logoError ? (
            <img 
              src="/assets/generated/uthaan-logo-transparent.dim_200x200.png" 
              alt="Uthaan Sewa Samiti" 
              className="h-10 w-10"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
              U
            </div>
          )}
          <span className="text-xl font-bold text-primary">
            {t('Uthaan Sewa Samiti', 'उत्थान सेवा समिति')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Admin Controls */}
          {isAuthenticated ? (
            <>
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                <ShieldCheck className="h-4 w-4" />
                {t('Admin Dashboard', 'व्यवस्थापक डैशबोर्ड')}
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                {t('Logout', 'लॉगआउट')}
              </Button>
            </>
          ) : (
            <Link to="/admin-login">
              <Button variant="ghost" size="sm" className="gap-2 opacity-50 hover:opacity-100">
                <ShieldCheck className="h-4 w-4" />
                {t('Admin Login', 'एडमिन लॉगिन')}
              </Button>
            </Link>
          )}
          
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {language === 'english' ? '🇬🇧 EN' : '🇮🇳 HI'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('hindi')}>
                🇮🇳 हिंदी
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('english')}>
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t('Toggle menu', 'मेनू टॉगल करें')}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary"
                activeProps={{ className: 'text-primary' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Admin Controls Mobile */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t('Admin Dashboard', 'व्यवस्थापक डैशबोर्ड')}
                </Link>
                <Button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {t('Logout', 'लॉगआउट')}
                </Button>
              </>
            ) : (
              <Link
                to="/admin-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="ghost" size="sm" className="w-full gap-2 opacity-50">
                  <ShieldCheck className="h-4 w-4" />
                  {t('Admin Login', 'एडमिन लॉगिन')}
                </Button>
              </Link>
            )}
            
            {/* Language Switcher Mobile */}
            <div className="flex gap-2">
              <Button
                variant={language === 'hindi' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setLanguage('hindi');
                  setMobileMenuOpen(false);
                }}
              >
                🇮🇳 हिंदी
              </Button>
              <Button
                variant={language === 'english' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setLanguage('english');
                  setMobileMenuOpen(false);
                }}
              >
                🇬🇧 English
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
