import { Link } from '@tanstack/react-router';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  const availableRoutes = [
    { to: '/', label: t('Home', 'होम'), icon: Home },
    { to: '/about', label: t('About Us', 'हमारे बारे में'), icon: Search },
    { to: '/projects', label: t('Projects', 'परियोजनाएं'), icon: Search },
    { to: '/gallery', label: t('Gallery', 'गैलरी'), icon: Search },
    { to: '/contact', label: t('Contact', 'संपर्क करें'), icon: Search },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <span className="text-6xl font-bold text-muted-foreground">404</span>
            </div>
            <CardTitle className="text-3xl">
              {t('Page Not Found', 'पृष्ठ नहीं मिला')}
            </CardTitle>
            <CardDescription className="text-lg">
              {t(
                'The page you are looking for does not exist or has been moved.',
                'आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  {t('Go to Home', 'होम पर जाएं')}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('Go Back', 'वापस जाएं')}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-center text-lg font-semibold">
                {t('Available Pages', 'उपलब्ध पृष्ठ')}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableRoutes.map((route) => (
                  <Link key={route.to} to={route.to}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
