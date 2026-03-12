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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Landmark, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetDonationDetails,
  useUpdateDonationDetails,
} from "../../hooks/useQueries";

export default function DonationManager() {
  const { data: donation, isLoading } = useGetDonationDetails();
  const updateDonation = useUpdateDonationDetails();
  const { t } = useLanguage();

  const [descriptionEnglish, setDescriptionEnglish] = useState("");
  const [descriptionHindi, setDescriptionHindi] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (donation) {
      setDescriptionEnglish(donation.description.english);
      setDescriptionHindi(donation.description.hindi);
      setBankName(donation.bankName);
      setAccountHolder(donation.accountHolder);
      setAccountNo(donation.accountNo);
      setIfsc(donation.ifsc);
      setUpiId(donation.upiId);
    }
  }, [donation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDonation.mutateAsync({
        description: {
          english: descriptionEnglish,
          hindi: descriptionHindi,
        },
        bankName,
        accountHolder,
        accountNo,
        ifsc,
        upiId,
      });
      toast.success(
        t(
          "Donation details updated successfully!",
          "दान विवरण सफलतापूर्वक अपडेट किया गया!",
        ),
      );
    } catch (_error) {
      toast.error(
        t("Failed to update donation details", "दान विवरण अपडेट करने में विफल"),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {t("Donation Details", "दान विवरण")}
        </CardTitle>
        <CardDescription>
          {t(
            "Configure bank account and UPI details for receiving donations",
            "दान प्राप्त करने के लिए बैंक खाता और यूपीआई विवरण कॉन्फ़िगर करें",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-ocid="donation.admin.panel"
        >
          {/* Description */}
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="hindi">🇮🇳 हिंदी</TabsTrigger>
            </TabsList>
            <TabsContent value="english" className="space-y-3">
              <Label htmlFor="desc-en">
                {t("Donation Appeal (English)", "दान अपील (अंग्रेज़ी)")}
              </Label>
              <Textarea
                id="desc-en"
                data-ocid="donation.admin.textarea"
                value={descriptionEnglish}
                onChange={(e) => setDescriptionEnglish(e.target.value)}
                rows={4}
                placeholder="Write a donation appeal message in English..."
              />
            </TabsContent>
            <TabsContent value="hindi" className="space-y-3">
              <Label htmlFor="desc-hi">
                {t("Donation Appeal (Hindi)", "दान अपील (हिंदी)")}
              </Label>
              <Textarea
                id="desc-hi"
                value={descriptionHindi}
                onChange={(e) => setDescriptionHindi(e.target.value)}
                rows={4}
                placeholder="हिंदी में दान अपील संदेश लिखें..."
              />
            </TabsContent>
          </Tabs>

          {/* Bank Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Landmark className="h-4 w-4 text-blue-600" />
              {t("Bank Account Details", "बैंक खाता विवरण")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-name">{t("Bank Name", "बैंक का नाम")}</Label>
                <Input
                  id="bank-name"
                  data-ocid="donation.admin.input"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={t(
                    "e.g. State Bank of India",
                    "जैसे: स्टेट बैंक ऑफ इंडिया",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-holder">
                  {t("Account Holder Name", "खाताधारक का नाम")}
                </Label>
                <Input
                  id="account-holder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder={t(
                    "Name as on bank account",
                    "बैंक खाते के अनुसार नाम",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-no">
                  {t("Account Number", "खाता संख्या")}
                </Label>
                <Input
                  id="account-no"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc">{t("IFSC Code", "आईएफएससी कोड")}</Label>
                <Input
                  id="ifsc"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="SBIN0000001"
                  maxLength={11}
                />
              </div>
            </div>
          </div>

          {/* UPI Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Smartphone className="h-4 w-4 text-green-600" />
              {t("UPI Details", "यूपीआई विवरण")}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="upi-id">{t("UPI ID", "यूपीआई आईडी")}</Label>
              <Input
                id="upi-id"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateDonation.isPending}
            data-ocid="donation.admin.save_button"
          >
            {updateDonation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Saving...", "सहेजा जा रहा है...")}
              </>
            ) : (
              t("Save Donation Details", "दान विवरण सहेजें")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
