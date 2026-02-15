import { Card, CardContent } from '@/components/ui/card';
import { useGetGalleryImages } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';

export default function GalleryPage() {
  const { data: galleryImages, isLoading } = useGetGalleryImages();
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

  const getCaption = (caption: { english: string; hindi: string }) => {
    return language === 'english' ? caption.english : caption.hindi;
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t('Gallery', 'गैलरी')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('View our collection of photos', 'हमारी तस्वीरों का संग्रह देखें')}
          </p>
        </div>

        {galleryImages && galleryImages.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="p-0">
                  <img
                    src={image.image.getDirectURL()}
                    alt={getCaption(image.caption) || t('Gallery image', 'गैलरी छवि')}
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
              {t('No images in the gallery yet.', 'अभी तक गैलरी में कोई छवियां नहीं हैं।')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
