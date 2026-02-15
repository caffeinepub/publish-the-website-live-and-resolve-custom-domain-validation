import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useGetOrganizationDetails, useAddContactMessage } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContactPage() {
  const { data: orgDetails } = useGetOrganizationDetails();
  const addMessage = useAddContactMessage();
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addMessage.mutateAsync({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      toast.success(t('Message sent successfully!', 'संदेश सफलतापूर्वक भेजा गया!'));
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(t('Failed to send message', 'संदेश भेजने में विफल'));
    }
  };

  const getAddress = () => {
    if (!orgDetails?.address) return t('123 NGO Street, City', '१२३ एनजीओ सड़क, शहर');
    return language === 'english' ? orgDetails.address.english : orgDetails.address.hindi;
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t('Contact Us', 'हमसे संपर्क करें')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('Get in touch with us', 'हमसे संपर्क करें')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Contact Information', 'संपर्क जानकारी')}</CardTitle>
              <CardDescription>
                {t('Reach out to us through any of these channels', 'इनमें से किसी भी माध्यम से हमसे संपर्क करें')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('Address', 'पता')}</p>
                  <p className="text-sm text-muted-foreground">{getAddress()}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('Email', 'ईमेल')}</p>
                  <a
                    href={`mailto:${orgDetails?.email || 'contact@uthaansewa.org'}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {orgDetails?.email || 'contact@uthaansewa.org'}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('Phone', 'फोन')}</p>
                  <p className="text-sm text-muted-foreground">{orgDetails?.phone || '123-456-7890'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Send us a message', 'हमें एक संदेश भेजें')}</CardTitle>
              <CardDescription>
                {t('Fill out the form below and we will get back to you', 'नीचे दिया गया फॉर्म भरें और हम आपसे संपर्क करेंगे')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('Name', 'नाम')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder={t('Your name', 'आपका नाम')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('Email', 'ईमेल')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder={t('Your email', 'आपका ईमेल')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('Message', 'संदेश')}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    required
                    placeholder={t('Your message', 'आपका संदेश')}
                  />
                </div>

                <Button type="submit" disabled={addMessage.isPending} className="w-full">
                  {addMessage.isPending ? t('Sending...', 'भेजा जा रहा है...') : t('Send Message', 'संदेश भेजें')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
