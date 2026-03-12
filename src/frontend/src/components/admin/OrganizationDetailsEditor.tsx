import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetOrganizationDetails,
  useUpdateOrganizationDetails,
} from "../../hooks/useQueries";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function OrganizationDetailsEditor() {
  const { data: orgDetails, isLoading } = useGetOrganizationDetails();
  const updateDetails = useUpdateOrganizationDetails();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameHindi: "",
    addressEnglish: "",
    addressHindi: "",
    email: "",
    phone: "",
    facebookLink: "",
    missionEnglish: "",
    missionHindi: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (orgDetails) {
      setFormData({
        nameEnglish: orgDetails.name.english,
        nameHindi: orgDetails.name.hindi,
        addressEnglish: orgDetails.address.english,
        addressHindi: orgDetails.address.hindi,
        email: orgDetails.email,
        phone: orgDetails.phone,
        facebookLink: orgDetails.facebookLink,
        missionEnglish: orgDetails.mission.english,
        missionHindi: orgDetails.mission.hindi,
      });
      if (orgDetails.logo) {
        setLogoPreview(orgDetails.logo.getDirectURL());
      }
    }
  }, [orgDetails]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        t(
          `Logo is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          `लोगो बहुत बड़ा है। अधिकतम आकार ${MAX_FILE_SIZE_MB}MB है।`,
        ),
      );
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let logoBlob: ExternalBlob | undefined = undefined;

      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        logoBlob = ExternalBlob.fromBytes(
          new Uint8Array(arrayBuffer),
        ).withUploadProgress((pct) => setUploadProgress(Math.round(pct)));
      } else if (!removeLogo && orgDetails?.logo) {
        logoBlob = orgDetails.logo;
      }

      await updateDetails.mutateAsync({
        name: {
          english: formData.nameEnglish,
          hindi: formData.nameHindi,
        },
        address: {
          english: formData.addressEnglish,
          hindi: formData.addressHindi,
        },
        email: formData.email,
        phone: formData.phone,
        facebookLink: formData.facebookLink,
        mission: {
          english: formData.missionEnglish,
          hindi: formData.missionHindi,
        },
        logo: logoBlob,
      });

      toast.success(
        t(
          "Organization details updated successfully!",
          "संगठन विवरण सफलतापूर्वक अपडेट किया गया!",
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(
          `Failed to update organization details: ${msg}`,
          `संगठन विवरण अपडेट करने में विफल: ${msg}`,
        ),
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBusy = isUploading || updateDetails.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Organization Details", "संगठन विवरण")}</CardTitle>
        <CardDescription>
          {t(
            "Update your organization's basic information",
            "अपने संगठन की बुनियादी जानकारी अपडेट करें",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo">{t("Logo", "लोगो")}</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt={t("Logo preview", "लोगो पूर्वावलोकन")}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isBusy}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    aria-label={t("Remove logo", "लोगो हटाएं")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={isBusy}
                />
                <Label
                  htmlFor="logo"
                  className={
                    isBusy ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }
                >
                  <div
                    className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
                    data-ocid="orgdetails.upload_button"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{t("Upload Logo", "लोगो अपलोड करें")}</span>
                  </div>
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    `Max ${MAX_FILE_SIZE_MB}MB`,
                    `अधिकतम ${MAX_FILE_SIZE_MB}MB`,
                  )}
                </p>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1" data-ocid="orgdetails.loading_state">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("Uploading logo…", "लोगो अपलोड हो रहा है…")}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="hindi">🇮🇳 हिंदी</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameEnglish">
                  {t("Organization Name", "संगठन का नाम")}
                </Label>
                <Input
                  id="nameEnglish"
                  data-ocid="orgdetails.input"
                  value={formData.nameEnglish}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEnglish: e.target.value })
                  }
                  required
                  disabled={isBusy}
                  placeholder="Enter organization name in English"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="missionEnglish">
                  {t("Mission Statement", "मिशन वक्तव्य")}
                </Label>
                <Textarea
                  id="missionEnglish"
                  value={formData.missionEnglish}
                  onChange={(e) =>
                    setFormData({ ...formData, missionEnglish: e.target.value })
                  }
                  rows={3}
                  required
                  disabled={isBusy}
                  placeholder="Enter mission statement in English"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressEnglish">{t("Address", "पता")}</Label>
                <Textarea
                  id="addressEnglish"
                  value={formData.addressEnglish}
                  onChange={(e) =>
                    setFormData({ ...formData, addressEnglish: e.target.value })
                  }
                  rows={2}
                  required
                  disabled={isBusy}
                  placeholder="Enter address in English"
                />
              </div>
            </TabsContent>

            <TabsContent value="hindi" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameHindi">
                  {t("Organization Name", "संगठन का नाम")}
                </Label>
                <Input
                  id="nameHindi"
                  value={formData.nameHindi}
                  onChange={(e) =>
                    setFormData({ ...formData, nameHindi: e.target.value })
                  }
                  required
                  disabled={isBusy}
                  placeholder="हिंदी में संगठन का नाम दर्ज करें"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="missionHindi">
                  {t("Mission Statement", "मिशन वक्तव्य")}
                </Label>
                <Textarea
                  id="missionHindi"
                  value={formData.missionHindi}
                  onChange={(e) =>
                    setFormData({ ...formData, missionHindi: e.target.value })
                  }
                  rows={3}
                  required
                  disabled={isBusy}
                  placeholder="हिंदी में मिशन वक्तव्य दर्ज करें"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressHindi">{t("Address", "पता")}</Label>
                <Textarea
                  id="addressHindi"
                  value={formData.addressHindi}
                  onChange={(e) =>
                    setFormData({ ...formData, addressHindi: e.target.value })
                  }
                  rows={2}
                  required
                  disabled={isBusy}
                  placeholder="हिंदी में पता दर्ज करें"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t("Email", "ईमेल")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isBusy}
                placeholder="contact@example.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("Phone", "फोन")}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={isBusy}
                placeholder="123-456-7890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">{t("Facebook Link", "फेसबुक लिंक")}</Label>
            <Input
              id="facebook"
              type="url"
              value={formData.facebookLink}
              onChange={(e) =>
                setFormData({ ...formData, facebookLink: e.target.value })
              }
              required
              disabled={isBusy}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            data-ocid="orgdetails.save_button"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Saving…", "सहेजा जा रहा है…")}
              </>
            ) : (
              t("Save Changes", "परिवर्तन सहेजें")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
