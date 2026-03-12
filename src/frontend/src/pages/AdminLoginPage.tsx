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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Shield, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { hashText, useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const SECURITY_QUESTIONS = [
  {
    value: "mother_maiden",
    english: "What is your mother's maiden name?",
    hindi: "आपकी माँ का मायके का नाम क्या है?",
  },
  {
    value: "first_pet",
    english: "What was the name of your first pet?",
    hindi: "आपके पहले पालतू जानवर का नाम क्या था?",
  },
  {
    value: "birth_city",
    english: "What city were you born in?",
    hindi: "आप किस शहर में पैदा हुए थे?",
  },
  {
    value: "favorite_teacher",
    english: "What is your favorite teacher's name?",
    hindi: "आपके पसंदीदा शिक्षक का नाम क्या है?",
  },
  {
    value: "primary_school",
    english: "What was the name of your primary school?",
    hindi: "आपके प्राथमिक विद्यालय का नाम क्या था?",
  },
];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<"loading" | "register" | "login">("loading");
  const [isLoading, setIsLoading] = useState(false);

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSecurityQuestion, setRegSecurityQuestion] = useState("");
  const [regSecurityAnswer, setRegSecurityAnswer] = useState("");
  const [regConfirmAnswer, setRegConfirmAnswer] = useState("");

  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
      return;
    }
    checkSetupStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const checkSetupStatus = async () => {
    try {
      const actor = (await createActorWithConfig()) as backendInterface;
      const isSetup = await actor.isAdminSetup();
      setMode(isSetup ? "login" : "register");
    } catch (error) {
      console.error("Error checking setup status:", error);
      setMode("login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regUsername.length < 3) {
      toast.error(
        t(
          "Username must be at least 3 characters",
          "उपयोगकर्ता नाम कम से कम 3 अक्षर का होना चाहिए",
        ),
      );
      return;
    }
    if (regPassword.length < 6) {
      toast.error(
        t(
          "Password must be at least 6 characters",
          "पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
        ),
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error(t("Passwords do not match", "पासवर्ड मेल नहीं खाते"));
      return;
    }
    if (!regSecurityQuestion) {
      toast.error(
        t("Please select a security question", "कृपया एक सुरक्षा प्रश्न चुनें"),
      );
      return;
    }
    if (regSecurityAnswer.length < 2) {
      toast.error(
        t(
          "Security answer must be at least 2 characters",
          "सुरक्षा उत्तर कम से कम 2 अक्षर का होना चाहिए",
        ),
      );
      return;
    }
    if (regSecurityAnswer !== regConfirmAnswer) {
      toast.error(t("Security answers do not match", "सुरक्षा उत्तर मेल नहीं खाते"));
      return;
    }

    setIsLoading(true);
    try {
      const [passwordHash, answerHash] = await Promise.all([
        hashText(regPassword),
        hashText(regSecurityAnswer),
      ]);

      // Find question label
      const questionObj = SECURITY_QUESTIONS.find(
        (q) => q.value === regSecurityQuestion,
      );
      const questionLabel =
        language === "hindi" ? questionObj?.hindi : questionObj?.english;

      const actor = (await createActorWithConfig()) as backendInterface;
      await actor.setupAdmin(
        regUsername,
        passwordHash,
        questionLabel || regSecurityQuestion,
        answerHash,
      );

      toast.success(
        t(
          "Admin account created successfully! Logging in...",
          "व्यवस्थापक खाता सफलतापूर्वक बनाया गया! लॉग इन हो रहा है...",
        ),
      );

      // Auto-login
      const success = await login(regUsername, regPassword);
      if (success) {
        navigate({ to: "/admin" });
      } else {
        setMode("login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        t("Failed to create admin account", "व्यवस्थापक खाता बनाने में विफल"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginUsername, loginPassword);
      if (success) {
        toast.success(t("Login successful!", "लॉगिन सफल!"));
        navigate({ to: "/admin" });
      } else {
        toast.error(
          t("Invalid username or password", "अमान्य उपयोगकर्ता नाम या पासवर्ड"),
        );
      }
    } catch (_error) {
      toast.error(t("Login failed", "लॉगिन विफल"));
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            {t("Loading...", "लोड हो रहा है...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {mode === "register" ? (
              <UserPlus className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle>
            {mode === "register"
              ? t("Create Admin Account", "व्यवस्थापक खाता बनाएं")
              : t("Admin Login", "व्यवस्थापक लॉगिन")}
          </CardTitle>
          <CardDescription>
            {mode === "register"
              ? t(
                  "Set up your admin ID and password to manage the website",
                  "वेबसाइट प्रबंधित करने के लिए अपनी व्यवस्थापक आईडी और पासवर्ड सेट करें",
                )
              : t(
                  "Enter your credentials to access the admin panel",
                  "व्यवस्थापक पैनल तक पहुंचने के लिए अपनी साख दर्ज करें",
                )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === "register" ? (
            <form
              onSubmit={handleRegister}
              className="space-y-4"
              data-ocid="admin.register.panel"
            >
              <div className="space-y-2">
                <Label htmlFor="reg-username">
                  {t("Admin ID", "व्यवस्थापक आईडी")}
                </Label>
                <Input
                  id="reg-username"
                  data-ocid="admin.input"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t("Choose an admin ID", "व्यवस्थापक आईडी चुनें")}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">{t("Password", "पासवर्ड")}</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t(
                    "Choose a strong password",
                    "एक मजबूत पासवर्ड चुनें",
                  )}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password">
                  {t("Confirm Password", "पासवर्ड की पुष्टि करें")}
                </Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t(
                    "Re-enter your password",
                    "पासवर्ड दोबारा दर्ज करें",
                  )}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-question">
                  {t("Security Question", "सुरक्षा प्रश्न")}
                </Label>
                <Select
                  value={regSecurityQuestion}
                  onValueChange={setRegSecurityQuestion}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="security-question"
                    data-ocid="admin.select"
                  >
                    <SelectValue
                      placeholder={t(
                        "Select a security question",
                        "सुरक्षा प्रश्न चुनें",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTIONS.map((q) => (
                      <SelectItem key={q.value} value={q.value}>
                        {language === "hindi" ? q.hindi : q.english}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Used to recover your account if you forget your password",
                    "पासवर्ड भूलने पर खाता पुनः प्राप्त करने के लिए उपयोग किया जाएगा",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-answer">
                  {t("Security Answer", "सुरक्षा उत्तर")}
                </Label>
                <Input
                  id="security-answer"
                  type="text"
                  value={regSecurityAnswer}
                  onChange={(e) => setRegSecurityAnswer(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t("Your answer", "आपका उत्तर")}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-security-answer">
                  {t("Confirm Security Answer", "सुरक्षा उत्तर की पुष्टि करें")}
                </Label>
                <Input
                  id="confirm-security-answer"
                  type="text"
                  value={regConfirmAnswer}
                  onChange={(e) => setRegConfirmAnswer(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t("Re-enter your answer", "उत्तर दोबारा दर्ज करें")}
                  autoComplete="off"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-ocid="admin.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Creating account...", "खाता बनाया जा रहा है...")}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {t("Create Admin Account", "व्यवस्थापक खाता बनाएं")}
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
              data-ocid="admin.login.panel"
            >
              <div className="space-y-2">
                <Label htmlFor="login-username">
                  {t("Admin ID", "व्यवस्थापक आईडी")}
                </Label>
                <Input
                  id="login-username"
                  data-ocid="admin.input"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t("Enter your admin ID", "व्यवस्थापक आईडी दर्ज करें")}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">
                  {t("Password", "पासवर्ड")}
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t("Enter your password", "पासवर्ड दर्ज करें")}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-ocid="admin.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Logging in...", "लॉग इन हो रहा है...")}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t("Login", "लॉगिन")}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  data-ocid="admin.link"
                >
                  {t("Forgot Password?", "पासवर्ड भूल गए?")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
