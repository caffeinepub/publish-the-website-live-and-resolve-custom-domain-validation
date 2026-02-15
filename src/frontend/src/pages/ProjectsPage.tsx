import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetProjects } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useGetProjects();
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

  const getTitle = (title: { english: string; hindi: string }) => {
    return language === 'english' ? title.english : title.hindi;
  };

  const getDescription = (description: { english: string; hindi: string }) => {
    return language === 'english' ? description.english : description.hindi;
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t('Our Projects', 'हमारी परियोजनाएं')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('Discover the initiatives we are working on', 'उन पहलों की खोज करें जिन पर हम काम कर रहे हैं')}
          </p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                {project.image && (
                  <img
                    src={project.image.getDirectURL()}
                    alt={getTitle(project.title)}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle>{getTitle(project.title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="whitespace-pre-wrap">
                    {getDescription(project.description)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              {t('No projects available yet.', 'अभी तक कोई परियोजनाएं उपलब्ध नहीं हैं।')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
