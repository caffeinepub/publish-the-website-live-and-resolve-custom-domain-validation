import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OrganizationDetailsEditor from '../components/admin/OrganizationDetailsEditor';
import AboutUsEditor from '../components/admin/AboutUsEditor';
import ProjectsManager from '../components/admin/ProjectsManager';
import GalleryManager from '../components/admin/GalleryManager';
import HomePageImagesManager from '../components/admin/HomePageImagesManager';
import ContactMessagesViewer from '../components/admin/ContactMessagesViewer';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validateCustomDomain, normalizeDomain } from '../utils/domainValidation';
import { toast } from 'sonner';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [customDomain, setCustomDomain] = useState('');
  const [domainError, setDomainError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/admin-login' });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleDomainValidation = () => {
    const normalized = normalizeDomain(customDomain);
    const validation = validateCustomDomain(normalized);
    
    if (!validation.isValid) {
      setDomainError(validation.message);
      toast.error(validation.message);
    } else {
      setDomainError('');
      toast.success(`Valid domain: ${normalized}`);
      // Here you would typically save the domain to backend or configuration
      console.log('Valid domain:', normalized);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">{t('Loading...', 'लोड हो रहा है...')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>{t('Access Denied', 'पहुंच अस्वीकृत')}</CardTitle>
            <CardDescription>
              {t('You need to be logged in to access the admin panel', 'व्यवस्थापक पैनल तक पहुंचने के लिए आपको लॉग इन होना होगा')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('Admin Dashboard', 'व्यवस्थापक डैशबोर्ड')}</h1>
        <p className="text-muted-foreground">
          {t('Manage your organization content', 'अपने संगठन की सामग्री प्रबंधित करें')}
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="organization">{t('Organization', 'संगठन')}</TabsTrigger>
          <TabsTrigger value="about">{t('About', 'हमारे बारे में')}</TabsTrigger>
          <TabsTrigger value="projects">{t('Projects', 'परियोजनाएं')}</TabsTrigger>
          <TabsTrigger value="homepage">{t('Home Images', 'होम छवियां')}</TabsTrigger>
          <TabsTrigger value="gallery">{t('Gallery', 'गैलरी')}</TabsTrigger>
          <TabsTrigger value="messages">{t('Messages', 'संदेश')}</TabsTrigger>
          <TabsTrigger value="domain">{t('Domain', 'डोमेन')}</TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <OrganizationDetailsEditor />
        </TabsContent>

        <TabsContent value="about">
          <AboutUsEditor />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="homepage">
          <HomePageImagesManager />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryManager />
        </TabsContent>

        <TabsContent value="messages">
          <ContactMessagesViewer />
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('Custom Domain Configuration', 'कस्टम डोमेन कॉन्फ़िगरेशन')}
              </CardTitle>
              <CardDescription>
                {t(
                  'Configure a custom domain for your website. Enter a fully qualified domain name.',
                  'अपनी वेबसाइट के लिए एक कस्टम डोमेन कॉन्फ़िगर करें। एक पूर्ण योग्य डोमेन नाम दर्ज करें।'
                )}
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">
                  {t('Domain Name', 'डोमेन नाम')}
                </Label>
                <Input
                  id="customDomain"
                  type="text"
                  placeholder="www.example.org"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setDomainError('');
                  }}
                  className={domainError ? 'border-destructive' : ''}
                />
                {domainError && (
                  <p className="text-sm text-destructive">{domainError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Example: www.uthaansewasamiti.org or uthaansewasamiti.org',
                    'उदाहरण: www.uthaansewasamiti.org या uthaansewasamiti.org'
                  )}
                </p>
              </div>
              <Button onClick={handleDomainValidation}>
                {t('Validate Domain', 'डोमेन सत्यापित करें')}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
