import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  KeyRound,
  Loader2,
  Shield,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import AboutUsEditor from "../components/admin/AboutUsEditor";
import ContactMessagesViewer from "../components/admin/ContactMessagesViewer";
import DonationManager from "../components/admin/DonationManager";
import GalleryManager from "../components/admin/GalleryManager";
import HomePageImagesManager from "../components/admin/HomePageImagesManager";
import MembersManager from "../components/admin/MembersManager";
import OrganizationDetailsEditor from "../components/admin/OrganizationDetailsEditor";
import ProjectsManager from "../components/admin/ProjectsManager";
import { createActorWithConfig } from "../config";
import { hashText, useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useGetCustomDomain, useSetCustomDomain } from "../hooks/useQueries";
import {
  normalizeDomain,
  validateCustomDomain,
} from "../utils/domainValidation";

function ChangeCredentialsPanel() {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 — security question
  const [securityQuestion, setSecurityQuestion] = useState("");
  // Step 2 — answer
  const [answer, setAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  // Step 3 — new credentials
  const [newId, setNewId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const loadSecurityQuestion = async () => {
    setIsLoading(true);
    try {
      const actor = (await createActorWithConfig()) as backendInterface & {
        getAdminSecurityQuestionWithoutId?: () => Promise<string>;
      };
      const question = actor.getAdminSecurityQuestionWithoutId
        ? await actor.getAdminSecurityQuestionWithoutId()
        : "";
      setSecurityQuestion(question);
      setStep(2);
    } catch {
      toast.error(
        t("Could not load security question", "सुरक्षा प्रश्न लोड नहीं हुआ"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error(t("Enter your security answer", "सुरक्षा उत्तर दर्ज करें"));
      return;
    }
    setIsLoading(true);
    try {
      const answerHash = await hashText(answer);
      const actor = (await createActorWithConfig()) as backendInterface & {
        verifySecurityAnswerWithoutId?: (hash: string) => Promise<string>;
      };
      const token = actor.verifySecurityAnswerWithoutId
        ? await actor.verifySecurityAnswerWithoutId(answerHash)
        : "";
      setResetToken(token);
      setStep(3);
    } catch {
      toast.error(t("Incorrect security answer", "सुरक्षा उत्तर गलत है"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim()) {
      toast.error(t("Admin ID cannot be empty", "आईडी खाली नहीं हो सकती"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(
        t(
          "Password must be at least 6 characters",
          "पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
        ),
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("Passwords do not match", "पासवर्ड मेल नहीं खाते"));
      return;
    }
    setIsLoading(true);
    try {
      const newPasswordHash = await hashText(newPassword);
      const actor = (await createActorWithConfig()) as backendInterface;
      await actor.resetAdminCredentials(
        resetToken,
        newId.trim(),
        newPasswordHash,
      );
      setDone(true);
      toast.success(
        t(
          "ID and Password updated successfully!",
          "आईडी और पासवर्ड सफलतापूर्वक बदले गए!",
        ),
      );
    } catch {
      toast.error(
        t(
          "Failed to update. Please try again.",
          "अपडेट करने में विफल। पुनः प्रयास करें।",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSecurityQuestion("");
    setAnswer("");
    setResetToken("");
    setNewId("");
    setNewPassword("");
    setConfirmPassword("");
    setDone(false);
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <p className="font-medium text-green-700">
          {t(
            "Admin ID and Password updated successfully!",
            "आईडी और पासवर्ड सफलतापूर्वक अपडेट हो गए!",
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(
            "Please log in again with the new credentials.",
            "अब नई आईडी और पासवर्ड से लॉगिन करें।",
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          data-ocid="account.secondary_button"
        >
          {t("Change Again", "फिर से बदलें")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 flex-1 ${s < step ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Start */}
      {step === 1 && (
        <div className="space-y-4" data-ocid="account.panel">
          <p className="text-sm text-muted-foreground">
            {t(
              "To change your Admin ID or Password, you need to verify your identity using your security question.",
              "आईडी या पासवर्ड बदलने के लिए, आपको अपने सुरक्षा प्रश्न से पहचान सत्यापित करनी होगी।",
            )}
          </p>
          <Button
            onClick={loadSecurityQuestion}
            disabled={isLoading}
            data-ocid="account.primary_button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("Loading...", "लोड हो रहा है...")}
              </>
            ) : (
              t("Start — Verify Identity", "शुरू करें — पहचान सत्यापित करें")
            )}
          </Button>
        </div>
      )}

      {/* Step 2 — Answer security question */}
      {step === 2 && (
        <form
          onSubmit={handleVerify}
          className="space-y-4"
          data-ocid="account.verify.panel"
        >
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium">
              {t("Security Question", "सुरक्षा प्रश्न")}:
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {securityQuestion}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-answer">{t("Your Answer", "आपका उत्तर")}</Label>
            <Input
              id="acc-answer"
              data-ocid="account.input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
              placeholder={t("Enter your answer", "अपना उत्तर दर्ज करें")}
              autoComplete="off"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
              data-ocid="account.cancel_button"
            >
              {t("Back", "वापस")}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
              data-ocid="account.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {t("Verifying...", "सत्यापित हो रहा है...")}
                </>
              ) : (
                t("Verify", "सत्यापित करें")
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3 — New ID & Password */}
      {step === 3 && (
        <form
          onSubmit={handleSave}
          className="space-y-4"
          data-ocid="account.reset.panel"
        >
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t(
                "Enter your new Admin ID and password below.",
                "नीचे नई Admin ID और पासवर्ड दर्ज करें।",
              )}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-new-id">
              {t("New Admin ID", "नई Admin ID")}
            </Label>
            <Input
              id="acc-new-id"
              data-ocid="account.input"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              disabled={isLoading}
              placeholder={t("Enter new admin ID", "नई आईडी दर्ज करें")}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-new-pass">
              {t("New Password", "नया पासवर्ड")}
            </Label>
            <Input
              id="acc-new-pass"
              type="password"
              data-ocid="account.input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              placeholder={t("Enter new password", "नया पासवर्ड दर्ज करें")}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-confirm-pass">
              {t("Confirm New Password", "पासवर्ड दोबारा दर्ज करें")}
            </Label>
            <Input
              id="acc-confirm-pass"
              type="password"
              data-ocid="account.input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder={t("Re-enter new password", "पासवर्ड दोबारा लिखें")}
              autoComplete="new-password"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-ocid="account.submit_button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("Saving...", "सेव हो रहा है...")}
              </>
            ) : (
              t("Save New ID & Password", "नई आईडी और पासवर्ड सेव करें")
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [customDomain, setCustomDomain] = useState("");
  const [domainError, setDomainError] = useState("");

  const { data: savedDomain, isLoading: domainLoading } = useGetCustomDomain();
  const setDomainMutation = useSetCustomDomain();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/admin-login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (savedDomain) {
      setCustomDomain(savedDomain);
    }
  }, [savedDomain]);

  const handleDomainValidation = async () => {
    const normalized = normalizeDomain(customDomain);
    const validation = validateCustomDomain(normalized);

    if (!validation.isValid) {
      setDomainError(validation.message);
      toast.error(validation.message);
    } else {
      setDomainError("");

      try {
        await setDomainMutation.mutateAsync(normalized);
        toast.success(`Domain saved successfully: ${normalized}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save domain. Please ensure you are authenticated.";
        setDomainError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">
            {t("Loading...", "लोड हो रहा है...")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>{t("Access Denied", "पहुंच अस्वीकृत")}</CardTitle>
            <CardDescription>
              {t(
                "You need to be logged in to access the admin panel",
                "व्यवस्थापक पैनल तक पहुंचने के लिए आपको लॉग इन होना होगा",
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {t("Admin Dashboard", "व्यवस्थापक डैशबोर्ड")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Manage your organization content",
            "अपने संगठन की सामग्री प्रबंधित करें",
          )}
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="organization">
            {t("Organization", "संगठन")}
          </TabsTrigger>
          <TabsTrigger value="about">{t("About", "हमारे बारे में")}</TabsTrigger>
          <TabsTrigger value="projects">
            {t("Projects", "परियोजनाएं")}
          </TabsTrigger>
          <TabsTrigger value="homepage">
            {t("Home Images", "होम छवियां")}
          </TabsTrigger>
          <TabsTrigger value="gallery">{t("Gallery", "गैलरी")}</TabsTrigger>
          <TabsTrigger value="members">{t("Members", "सदस्य")}</TabsTrigger>
          <TabsTrigger value="donation">{t("Donation", "दान")}</TabsTrigger>
          <TabsTrigger value="messages">{t("Messages", "संदेश")}</TabsTrigger>
          <TabsTrigger value="domain">{t("Domain", "डोमेन")}</TabsTrigger>
          <TabsTrigger value="account" data-ocid="account.tab">
            {t("Account", "अकाउंट")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <OrganizationDetailsEditor />
        </TabsContent>

        <TabsContent value="about">
          <AboutUsEditor />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="homepage">
          <HomePageImagesManager />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryManager />
        </TabsContent>

        <TabsContent value="members">
          <MembersManager />
        </TabsContent>

        <TabsContent value="donation">
          <DonationManager />
        </TabsContent>

        <TabsContent value="messages">
          <ContactMessagesViewer />
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain Configuration
              </CardTitle>
              <CardDescription>
                Configure a custom domain for your website. This setting stores
                your preferred domain name for reference.
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
              {domainLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading saved domain...
                </div>
              ) : savedDomain ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Currently saved domain:</strong> {savedDomain}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No custom domain configured yet.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h3 className="font-semibold text-sm">Important Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Your current working URL:</strong>{" "}
                    <code className="bg-background px-1.5 py-0.5 rounded">
                      uthaansewasamiti-1eg.caffeine.xyz
                    </code>
                  </p>
                  <p>
                    This URL will continue to work unless you complete the full
                    custom domain setup process.
                  </p>
                  <p className="font-medium text-foreground mt-3">
                    To use a custom domain, you must:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>
                      Purchase and own the domain name from a domain registrar
                    </li>
                    <li>
                      Configure DNS records to point to the Internet Computer
                      boundary nodes
                    </li>
                    <li>Complete the IC custom domain registration process</li>
                    <li>
                      Verify the domain is correctly pointed and accessible
                    </li>
                  </ol>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Domain Name</Label>
                <Input
                  id="customDomain"
                  data-ocid="domain.input"
                  type="text"
                  placeholder="www.example.org"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setDomainError("");
                  }}
                  className={domainError ? "border-destructive" : ""}
                />
                {domainError && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="domain.error_state"
                  >
                    {domainError}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Example: www.uthaansewasamiti.org or uthaansewasamiti.org
                </p>
              </div>

              <Button
                onClick={handleDomainValidation}
                disabled={setDomainMutation.isPending}
                data-ocid="domain.save_button"
              >
                {setDomainMutation.isPending
                  ? "Saving..."
                  : "Validate & Save Domain"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="max-w-lg space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  {t("Change Admin ID & Password", "Admin ID और पासवर्ड बदलें")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "You can change your Admin ID and/or password here. Your security question will be used to verify your identity.",
                    "यहाँ से आप अपनी Admin ID और/या पासवर्ड बदल सकते हैं। सुरक्षा प्रश्न से पहचान सत्यापित होगी।",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangeCredentialsPanel />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  {t("Forgot Password / ID?", "पासवर्ड / आईडी भूल गए?")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "If you are locked out, use the forgot password page to recover access.",
                    "अगर लॉगिन नहीं हो रहा तो फॉरगॉट पासवर्ड पेज का उपयोग करें।",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/forgot-password">
                  <Button
                    variant="outline"
                    data-ocid="account.secondary_button"
                  >
                    {t("Go to Forgot Password Page", "फॉरगॉट पासवर्ड पेज पर जाएं")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
