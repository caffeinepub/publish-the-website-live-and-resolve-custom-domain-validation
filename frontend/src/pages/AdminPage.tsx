import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import OrganizationDetailsEditor from '../components/admin/OrganizationDetailsEditor';
import AboutUsEditor from '../components/admin/AboutUsEditor';
import ProjectsManager from '../components/admin/ProjectsManager';
import GalleryManager from '../components/admin/GalleryManager';
import HomePageImagesManager from '../components/admin/HomePageImagesManager';
import ContactMessagesViewer from '../components/admin/ContactMessagesViewer';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validateCustomDomain, normalizeDomain } from '../utils/domainValidation';
import { useGetCustomDomain, useSetCustomDomain } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [customDomain, setCustomDomain] = useState('');
  const [domainError, setDomainError] = useState('');

  const { data: savedDomain, isLoading: domainLoading } = useGetCustomDomain();
  const setDomainMutation = useSetCustomDomain();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/admin-login' });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (savedDomain) {
      setCustomDomain(savedDomain);
    }
  }, [savedDomain]);

  const handleDomainValidation = async () => {
    const normalized = normalizeDomain(customDomain);
    const validation = validateCustomDomain(normalized);
    
    if (!validation.isValid) {
      setDomainError(validation.message);
      toast.error(validation.message);
    } else {
      setDomainError('');
      
      try {
        await setDomainMutation.mutateAsync(normalized);
        toast.success(`Domain saved successfully: ${normalized}`);
      } catch (error: any) {
        console.error('Failed to save domain:', error);
        const errorMessage = error.message || 'Failed to save domain. Please ensure you are authenticated.';
        setDomainError(errorMessage);
        toast.error(errorMessage);
      }
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
                Custom Domain Configuration
              </CardTitle>
              <CardDescription>
                Configure a custom domain for your website. This setting stores your preferred domain name for reference.
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
              {/* Current Status */}
              {domainLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Loading saved domain...
                </div>
              ) : savedDomain ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Currently saved domain:</strong> {savedDomain}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No custom domain configured yet.
                  </AlertDescription>
                </Alert>
              )}

              {/* Guidance Section */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h3 className="font-semibold text-sm">Important Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Your current working URL:</strong> <code className="bg-background px-1.5 py-0.5 rounded">uthaansewasamiti-1eg.caffeine.xyz</code>
                  </p>
                  <p>
                    This URL will continue to work unless you complete the full custom domain setup process.
                  </p>
                  <p className="font-medium text-foreground mt-3">
                    To use a custom domain, you must:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Purchase and own the domain name from a domain registrar</li>
                    <li>Configure DNS records to point to the Internet Computer boundary nodes</li>
                    <li>Complete the IC custom domain registration process</li>
                    <li>Verify the domain is correctly pointed and accessible</li>
                  </ol>
                  <p className="mt-3 text-xs">
                    <strong>Note:</strong> Saving a domain in this dashboard alone does not change your hosting or make the domain work automatically. It only stores the value for your reference and configuration.
                  </p>
                </div>
              </div>

              {/* Domain Input */}
              <div className="space-y-2">
                <Label htmlFor="customDomain">
                  Domain Name
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
                  Example: www.uthaansewasamiti.org or uthaansewasamiti.org
                </p>
              </div>

              <Button 
                onClick={handleDomainValidation}
                disabled={setDomainMutation.isPending}
              >
                {setDomainMutation.isPending ? 'Saving...' : 'Validate & Save Domain'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
