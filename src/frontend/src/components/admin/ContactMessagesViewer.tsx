import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetContactMessages } from '../../hooks/useQueries';
import { Mail, User, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ContactMessagesViewer() {
  const { data: messages, isLoading } = useGetContactMessages();
  const { t } = useLanguage();

  if (isLoading) {
    return <div>{t('Loading...', 'लोड हो रहा है...')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Contact Messages', 'संपर्क संदेश')}</CardTitle>
        <CardDescription>{t('View messages received from the contact form', 'संपर्क फॉर्म से प्राप्त संदेश देखें')}</CardDescription>
      </CardHeader>
      <CardContent>
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{message.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${message.email}`} className="text-sm text-muted-foreground hover:text-primary">
                          {message.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(parseInt(message.id)).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t('No messages received yet', 'अभी तक कोई संदेश प्राप्त नहीं हुआ')}</p>
        )}
      </CardContent>
    </Card>
  );
}
