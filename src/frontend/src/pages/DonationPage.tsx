import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Copy, Heart, Landmark, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useGetDonationDetails } from "../hooks/useQueries";

export default function DonationPage() {
  const { data: donation, isLoading } = useGetDonationDetails();
  const { t, language } = useLanguage();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const copyToClipboard = async (text: string, type: "upi" | "account") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "upi") {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
      } else {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      }
      toast.success(t("Copied to clipboard!", "क्लिपबोर्ड पर कॉपी किया गया!"));
    } catch {
      toast.error(t("Failed to copy", "कॉपी करने में विफल"));
    }
  };

  const getDescription = () => {
    if (!donation) return "";
    return language === "hindi"
      ? donation.description.hindi
      : donation.description.english;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 fill-primary text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {t("Support Our Cause", "हमारे उद्देश्य को सहारा दें")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t(
              "Your generous donation helps us serve the community and make a lasting difference.",
              "आपका उदार दान हमें समुदाय की सेवा करने और एक स्थायी बदलाव लाने में मदद करता है।",
            )}
          </p>
          <Badge variant="secondary" className="mt-4 text-sm">
            <Heart className="mr-1 h-3 w-3 fill-current" />
            {t("Every rupee counts", "हर रुपया मायने रखता है")}
          </Badge>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : donation ? (
          <div
            className="mx-auto max-w-2xl space-y-6"
            data-ocid="donation.section"
          >
            {/* Description */}
            {getDescription() && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-center text-base leading-relaxed text-foreground">
                    {getDescription()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bank Transfer */}
            <Card className="overflow-hidden" data-ocid="donation.card">
              <CardHeader className="bg-gradient-to-r from-blue-600/10 to-blue-600/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-blue-600" />
                  {t("Bank Transfer", "बैंक हस्तांतरण")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "Transfer directly to our bank account",
                    "हमारे बैंक खाते में सीधे ट्रांसफर करें",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("Bank Name", "बैंक का नाम")}
                      </p>
                      <p className="mt-0.5 font-semibold">
                        {donation.bankName || t("—", "—")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("Account Holder", "खाताधारक")}
                      </p>
                      <p className="mt-0.5 font-semibold">
                        {donation.accountHolder || t("—", "—")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("Account Number", "खाता संख्या")}
                      </p>
                      <p className="mt-0.5 font-mono font-semibold tracking-wider">
                        {donation.accountNo || t("—", "—")}
                      </p>
                    </div>
                    {donation.accountNo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(donation.accountNo, "account")
                        }
                        className="ml-2 flex-shrink-0"
                        data-ocid="donation.secondary_button"
                        aria-label={t(
                          "Copy account number",
                          "खाता संख्या कॉपी करें",
                        )}
                      >
                        {copiedAccount ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("IFSC Code", "आईएफएससी कोड")}
                      </p>
                      <p className="mt-0.5 font-mono font-semibold tracking-wider">
                        {donation.ifsc || t("—", "—")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UPI Payment */}
            {donation.upiId && (
              <Card className="overflow-hidden" data-ocid="donation.upi.card">
                <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-600/5 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    {t("UPI Payment", "यूपीआई भुगतान")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "Pay via any UPI app — PhonePe, GPay, Paytm, etc.",
                      "किसी भी यूपीआई ऐप से भुगतान करें — PhonePe, GPay, Paytm आदि",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("UPI ID", "यूपीआई आईडी")}
                      </p>
                      <p className="mt-1 font-mono text-lg font-bold text-primary">
                        {donation.upiId}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(donation.upiId, "upi")}
                      className="ml-4 flex-shrink-0 gap-2"
                      data-ocid="donation.primary_button"
                    >
                      {copiedUpi ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {t("Copied!", "कॉपी!")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          {t("Copy", "कॉपी करें")}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-8 text-center">
                <Heart className="mx-auto mb-3 h-10 w-10 fill-primary/20 text-primary" />
                <h3 className="mb-2 text-xl font-bold">
                  {t("Thank You for Your Support!", "आपके समर्थन के लिए धन्यवाद!")}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    "Your contribution helps us continue our mission of community service and upliftment.",
                    "आपका योगदान हमें सामुदायिक सेवा और उत्थान के अपने मिशन को जारी रखने में मदद करता है।",
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div
            className="mx-auto max-w-2xl text-center"
            data-ocid="donation.empty_state"
          >
            <p className="text-muted-foreground">
              {t(
                "Donation details will be added soon.",
                "दान विवरण जल्द ही जोड़े जाएंगे।",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
