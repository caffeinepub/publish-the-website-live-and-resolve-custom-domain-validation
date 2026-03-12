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
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { hashText } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

type FlowMode = "with-id" | "without-id";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [flowMode, setFlowMode] = useState<FlowMode>("with-id");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");

  // Step 2
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Step 3
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [done, setDone] = useState(false);

  // Flow: user knows their ID
  const handleStep1WithId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(
        t("Please enter your admin ID", "कृपया अपनी व्यवस्थापक आईडी दर्ज करें"),
      );
      return;
    }
    setIsLoading(true);
    try {
      const actor = (await createActorWithConfig()) as backendInterface;
      const question = await actor.getSecurityQuestion(username.trim());
      setSecurityQuestion(question);
      setNewUsername(username.trim());
      setStep(2);
    } catch {
      toast.error(t("Admin ID not found", "व्यवस्थापक आईडी नहीं मिली"));
    } finally {
      setIsLoading(false);
    }
  };

  // Flow: user forgot their ID — skip Step 1, directly get security question
  const handleForgotIdFlow = async () => {
    setIsLoading(true);
    try {
      const actor = (await createActorWithConfig()) as backendInterface;
      const question = await actor.getAdminSecurityQuestionWithoutId();
      setSecurityQuestion(question);
      setFlowMode("without-id");
      setStep(2);
    } catch {
      toast.error(
        t(
          "Could not load security question. Please try again.",
          "सुरक्षा प्रश्न लोड नहीं हुआ। कृपया पुनः प्रयास करें।",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      toast.error(
        t("Please enter your security answer", "कृपया अपना सुरक्षा उत्तर दर्ज करें"),
      );
      return;
    }
    setIsLoading(true);
    try {
      const answerHash = await hashText(securityAnswer);
      const actor = (await createActorWithConfig()) as backendInterface;
      let token: string;
      if (flowMode === "without-id") {
        token = await actor.verifySecurityAnswerWithoutId(answerHash);
      } else {
        token = await actor.verifySecurityAnswer(username.trim(), answerHash);
      }
      setResetToken(token);
      setStep(3);
    } catch {
      toast.error(t("Incorrect security answer", "सुरक्षा उत्तर गलत है"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
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
    if (newPassword !== confirmNewPassword) {
      toast.error(t("Passwords do not match", "पासवर्ड मेल नहीं खाते"));
      return;
    }
    setIsLoading(true);
    try {
      const newPasswordHash = await hashText(newPassword);
      const actor = (await createActorWithConfig()) as backendInterface;
      await actor.resetAdminCredentials(
        resetToken,
        newUsername.trim(),
        newPasswordHash,
      );
      setDone(true);
      toast.success(
        t(
          "ID and Password reset successfully!",
          "आईडी और पासवर्ड सफलतापूर्वक रीसेट हुए!",
        ),
      );
      setTimeout(() => navigate({ to: "/admin-login" }), 2000);
    } catch {
      toast.error(
        t(
          "Failed to reset. Please try again.",
          "रीसेट करने में विफल। कृपया पुनः प्रयास करें।",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = [
    t("Enter Admin ID", "आईडी दर्ज करें"),
    t("Verify Identity", "पहचान सत्यापित करें"),
    t("Set New ID & Password", "नई आईडी और पासवर्ड सेट करें"),
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {done ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <KeyRound className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle>
            {done
              ? t("Reset Successful", "रीसेट सफल हुआ")
              : t("Reset ID & Password", "आईडी और पासवर्ड रीसेट करें")}
          </CardTitle>
          {!done && (
            <CardDescription>
              {t("Step", "चरण")} {step}/3 — {stepLabels[step - 1]}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {done ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t(
                  "Your ID and password have been reset. Redirecting to login...",
                  "आपकी आईडी और पासवर्ड रीसेट हो गए हैं। लॉगइन पर जा रहे हैं...",
                )}
              </p>
              <Link to="/admin-login">
                <Button className="w-full" data-ocid="forgot.link">
                  {t("Go to Login", "लॉगइन पर जाएं")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Progress indicator */}
              <div className="mb-6 flex items-center gap-2">
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

              {/* STEP 1 — Enter ID (only shown in with-id flow) */}
              {step === 1 && (
                <form
                  onSubmit={handleStep1WithId}
                  className="space-y-4"
                  data-ocid="forgot.panel"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fp-username">
                      {t("Current Admin ID", "वर्तमान व्यवस्थापक आईडी")}
                    </Label>
                    <Input
                      id="fp-username"
                      data-ocid="forgot.input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t(
                        "Enter your current admin ID",
                        "वर्तमान आईडी दर्ज करें",
                      )}
                      autoComplete="username"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-ocid="forgot.submit_button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        {t("Searching...", "खोज रहा है...")}
                      </>
                    ) : (
                      t("Next", "अगला")
                    )}
                  </Button>

                  {/* Option for those who forgot their ID too */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                      {t("Forgot your Admin ID too?", "आईडी भी भूल गए?")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={handleForgotIdFlow}
                      data-ocid="forgot.secondary_button"
                      className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          {t("Loading...", "लोड हो रहा है...")}
                        </>
                      ) : (
                        t("Reset without ID", "आईडी के बिना रीसेट करें")
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2 — Security question */}
              {step === 2 && (
                <form
                  onSubmit={handleStep2}
                  className="space-y-4"
                  data-ocid="forgot.verify.panel"
                >
                  {flowMode === "without-id" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t(
                          "You can set a new Admin ID in the next step.",
                          "अगले चरण में आप नई आईडी सेट कर सकते हैं।",
                        )}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground">
                      {t("Security Question", "सुरक्षा प्रश्न")}:
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {securityQuestion}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fp-answer">
                      {t("Your Answer", "आपका उत्तर")}
                    </Label>
                    <Input
                      id="fp-answer"
                      data-ocid="forgot.input"
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t("Enter your answer", "अपना उत्तर दर्ज करें")}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        setFlowMode("with-id");
                        setSecurityAnswer("");
                      }}
                      disabled={isLoading}
                      data-ocid="forgot.cancel_button"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t("Back", "वापस")}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                      data-ocid="forgot.submit_button"
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

              {/* STEP 3 — Set new ID & Password */}
              {step === 3 && (
                <form
                  onSubmit={handleStep3}
                  className="space-y-4"
                  data-ocid="forgot.reset.panel"
                >
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {t(
                        "You can change your Admin ID and/or set a new password below.",
                        "आप नीचे अपनी आईडी और/या नया पासवर्ड सेट कर सकते हैं।",
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-username">
                      {t("New Admin ID", "नई आईडी")}
                    </Label>
                    <Input
                      id="new-username"
                      data-ocid="forgot.input"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t("Enter new admin ID", "नई आईडी दर्ज करें")}
                      autoComplete="username"
                    />
                    {flowMode === "with-id" && (
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "Leave as-is to keep the same ID",
                          "समान आईडी रखना हो तो जैसा है वैसा छोड़ें",
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">
                      {t("New Password", "नया पासवर्ड")}
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      data-ocid="forgot.input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t("Enter new password", "नया पासवर्ड दर्ज करें")}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">
                      {t("Confirm New Password", "नए पासवर्ड की पुष्टि करें")}
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      data-ocid="forgot.input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t(
                        "Re-enter new password",
                        "नया पासवर्ड दोबारा दर्ज करें",
                      )}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-ocid="forgot.submit_button"
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

              <div className="mt-4 text-center">
                <Link
                  to="/admin-login"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  data-ocid="forgot.link"
                >
                  ← {t("Back to Login", "लॉगइन पर वापस जाएं")}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
