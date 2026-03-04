import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createAdminCredentials, hasAdminCredentials } from '../contexts/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [isSetup, setIsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if this is first-time setup
    setIsSetup(!hasAdminCredentials());
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t('Passwords do not match', 'पासवर्ड मेल नहीं खाते'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('Password must be at least 6 characters', 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए'));
      return;
    }

    if (username.length < 3) {
      toast.error(t('Username must be at least 3 characters', 'उपयोगकर्ता नाम कम से कम 3 अक्षर का होना चाहिए'));
      return;
    }

    setIsLoading(true);
    try {
      await createAdminCredentials(username, password);
      toast.success(t('Admin account created successfully!', 'व्यवस्थापक खाता सफलतापूर्वक बनाया गया!'));
      setIsSetup(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(t('Failed to create admin account', 'व्यवस्थापक खाता बनाने में विफल'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast.success(t('Login successful!', 'लॉगिन सफल!'));
        navigate({ to: '/admin' });
      } else {
        toast.error(t('Invalid username or password', 'अमान्य उपयोगकर्ता नाम या पासवर्ड'));
      }
    } catch (error) {
      toast.error(t('Login failed', 'लॉगिन विफल'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isSetup ? <Shield className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle>
            {isSetup 
              ? t('Admin Setup', 'व्यवस्थापक सेटअप')
              : t('Admin Login', 'व्यवस्थापक लॉगिन')
            }
          </CardTitle>
          <CardDescription>
            {isSetup
              ? t('Create your admin ID and password', 'अपना व्यवस्थापक आईडी और पासवर्ड बनाएं')
              : t('Enter your credentials to access the admin panel', 'व्यवस्थापक पैनल तक पहुंचने के लिए अपनी साख दर्ज करें')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {t('Admin ID', 'व्यवस्थापक आईडी')}
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder={t('Enter admin ID', 'व्यवस्थापक आईडी दर्ज करें')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t('Password', 'पासवर्ड')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder={t('Enter password', 'पासवर्ड दर्ज करें')}
              />
            </div>

            {isSetup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('Confirm Password', 'पासवर्ड की पुष्टि करें')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t('Confirm password', 'पासवर्ड की पुष्टि करें')}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? t('Please wait...', 'कृपया प्रतीक्षा करें...')
                : isSetup
                ? t('Create Admin Account', 'व्यवस्थापक खाता बनाएं')
                : t('Login', 'लॉगिन')
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
