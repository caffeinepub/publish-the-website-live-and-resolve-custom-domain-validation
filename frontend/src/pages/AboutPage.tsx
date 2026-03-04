import { Card, CardContent } from '@/components/ui/card';
import { useGetAboutUsContent } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutPage() {
  const { data: aboutContent, isLoading } = useGetAboutUsContent();
  const { language, t } = useLanguage();

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

  const content = aboutContent
    ? (language === 'english' ? aboutContent.english : aboutContent.hindi)
    : t(
        'Uthaan Sewa Samiti is committed to community welfare and development.',
        'उत्थान सेवा समिति समाज कल्याण और विकास के लिए प्रतिबद्ध है।'
      );

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t('About Us', 'हमारे बारे में')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('Learn more about our mission and values', 'हमारे मिशन और मूल्यों के बारे में और जानें')}
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-lg max-w-none p-8 dark:prose-invert">
            <div className="whitespace-pre-wrap">{content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
