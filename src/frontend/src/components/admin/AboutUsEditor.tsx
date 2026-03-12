import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetAboutUsContent,
  useUpdateAboutUsContent,
} from "../../hooks/useQueries";

export default function AboutUsEditor() {
  const { data: aboutContent, isLoading } = useGetAboutUsContent();
  const updateContent = useUpdateAboutUsContent();
  const { t } = useLanguage();
  const [contentEnglish, setContentEnglish] = useState("");
  const [contentHindi, setContentHindi] = useState("");

  useEffect(() => {
    if (aboutContent) {
      setContentEnglish(aboutContent.english);
      setContentHindi(aboutContent.hindi);
    }
  }, [aboutContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateContent.mutateAsync({
        english: contentEnglish,
        hindi: contentHindi,
      });
      toast.success(
        t(
          "About Us content updated successfully!",
          "हमारे बारे में सामग्री सफलतापूर्वक अपडेट की गई!",
        ),
      );
    } catch (_error) {
      toast.error(
        t(
          "Failed to update About Us content",
          "हमारे बारे में सामग्री अपडेट करने में विफल",
        ),
      );
    }
  };

  if (isLoading) {
    return <div>{t("Loading...", "लोड हो रहा है...")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("About Us Content", "हमारे बारे में सामग्री")}</CardTitle>
        <CardDescription>
          {t(
            "Edit the About Us page content in both languages",
            "दोनों भाषाओं में हमारे बारे में पृष्ठ सामग्री संपादित करें",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="hindi">🇮🇳 हिंदी</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentEnglish">
                  {t("About Us Content (English)", "हमारे बारे में सामग्री (अंग्रेज़ी)")}
                </Label>
                <Textarea
                  id="contentEnglish"
                  value={contentEnglish}
                  onChange={(e) => setContentEnglish(e.target.value)}
                  rows={15}
                  required
                  placeholder="Enter the About Us content in English..."
                />
              </div>
            </TabsContent>

            <TabsContent value="hindi" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentHindi">
                  {t("About Us Content (Hindi)", "हमारे बारे में सामग्री (हिंदी)")}
                </Label>
                <Textarea
                  id="contentHindi"
                  value={contentHindi}
                  onChange={(e) => setContentHindi(e.target.value)}
                  rows={15}
                  required
                  placeholder="हिंदी में हमारे बारे में सामग्री दर्ज करें..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={updateContent.isPending}>
            {updateContent.isPending
              ? t("Saving...", "सहेजा जा रहा है...")
              : t("Save Changes", "परिवर्तन सहेजें")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
