import { SiFacebook } from 'react-icons/si';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { useGetOrganizationDetails } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { data: orgDetails } = useGetOrganizationDetails();
  const { language, t } = useLanguage();
  const [logoError, setLogoError] = useState(false);

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

  const getAddress = () => {
    if (!orgDetails?.address) return t('123 NGO Street, City', '१२३ एनजीओ सड़क, शहर');
    return language === 'english' ? orgDetails.address.english : orgDetails.address.hindi;
  };

  const getAppIdentifier = () => {
    try {
      return encodeURIComponent(window.location.hostname || 'uthaan-sewa-samiti');
    } catch {
      return 'uthaan-sewa-samiti';
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              {!logoError ? (
                <img 
                  src="/assets/generated/uthaan-logo-transparent.dim_200x200.png" 
                  alt={getName()} 
                  className="h-10 w-10"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  U
                </div>
              )}
              <h3 className="text-lg font-bold">{getName()}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{getMission()}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">{t('Contact Us', 'संपर्क करें')}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{getAddress()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${orgDetails?.email || 'contact@uthaansewa.org'}`} className="hover:text-primary">
                  {orgDetails?.email || 'contact@uthaansewa.org'}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{orgDetails?.phone || '123-456-7890'}</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">{t('Follow Us', 'हमें फॉलो करें')}</h3>
            <div className="flex space-x-4">
              <a
                href={orgDetails?.facebookLink || 'https://facebook.com/uthaansewa'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Facebook"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()}. {t('Built with', 'के साथ बनाया गया')}{' '}
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />{' '}
            {t('using', 'उपयोग करके')}{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${getAppIdentifier()}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
