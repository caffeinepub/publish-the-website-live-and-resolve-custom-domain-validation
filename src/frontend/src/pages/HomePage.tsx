import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useGetOrganizationDetails, useGetHomepageImages } from '../hooks/useQueries';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: orgDetails, isLoading: orgLoading } = useGetOrganizationDetails();
  const { data: homepageImages, isLoading: homepageLoading } = useGetHomepageImages();
  const { language, t } = useLanguage();

  const isLoading = orgLoading || homepageLoading;

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

  const displayImages = homepageImages?.slice(0, 6) || [];

  const getName = () => {
    if (!orgDetails?.name) return t('Uthaan Sewa Samiti', 'उत्थान सेवा समिति');
    return language === 'english' ? orgDetails.name.english : orgDetails.name.hindi;
  };

  const getMission = () => {
    if (!orgDetails?.mission) {
      return t(
        'Dedicated to serving the community through various social initiatives.',
        'विभिन्न सामाजिक पहलों के माध्यम से समुदाय की सेवा के लिए समर्पित।'
      );
    }
    return language === 'english' ? orgDetails.mission.english : orgDetails.mission.hindi;
  };

  const getCaption = (caption: { english: string; hindi: string }) => {
    return language === 'english' ? caption.english : caption.hindi;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {getName()}
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                {getMission()}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/projects' })}>
                  {t('View Our Projects', 'हमारी परियोजनाएं देखें')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/contact' })}>
                  {t('Get Involved', 'शामिल हों')}
                </Button>
              </div>
            </div>
            <div className="relative">
              {orgDetails?.logo ? (
                <img
                  src={orgDetails.logo.getDirectURL()}
                  alt={getName()}
                  className="mx-auto h-auto w-full max-w-md rounded-lg shadow-2xl"
                />
              ) : (
                <div className="mx-auto flex h-64 w-full max-w-md items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">{t('Logo', 'लोगो')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            {t('Recent Activities', 'हाल की गतिविधियाँ')}
          </h2>
          {displayImages.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayImages.map((image) => (
                <Card key={image.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    <img
                      src={image.image.getDirectURL()}
                      alt={getCaption(image.caption) || t('Home page image', 'होम पेज छवि')}
                      className="h-64 w-full object-cover"
                    />
                    {image.caption && (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">{getCaption(image.caption)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">
                {t('No activity images available yet.', 'अभी तक कोई गतिविधि छवियाँ उपलब्ध नहीं हैं।')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('Add images to the home page through the admin panel.', 'व्यवस्थापक पैनल के माध्यम से होम पेज में छवियाँ जोड़ें।')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            {t('Make a Difference Today', 'आज ही बदलाव लाएं')}
          </h2>
          <p className="mb-8 text-lg opacity-90">
            {t(
              'Join us in our mission to bring positive change to our community.',
              'हमारे समुदाय में सकारात्मक परिवर्तन लाने के हमारे मिशन में हमारे साथ जुड़ें।'
            )}
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate({ to: '/contact' })}>
            {t('Contact Us', 'हमसे संपर्क करें')}
          </Button>
        </div>
      </section>
    </div>
  );
}
