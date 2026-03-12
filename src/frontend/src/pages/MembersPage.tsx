import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Shield, Star, Users } from "lucide-react";
import { type Member, MemberType } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import { useGetMembers } from "../hooks/useQueries";

const SECTION_CONFIG: Array<{
  type: MemberType;
  labelEn: string;
  labelHi: string;
  icon: React.ReactNode;
  badgeClass: string;
}> = [
  {
    type: MemberType.coreCommittee,
    labelEn: "Core Committee Members",
    labelHi: "मुख्य समिति सदस्य",
    icon: <Shield className="h-6 w-6" />,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  {
    type: MemberType.mainMember,
    labelEn: "Main Members",
    labelHi: "मुख्य सदस्य",
    icon: <Star className="h-6 w-6" />,
    badgeClass: "bg-secondary/50 text-secondary-foreground border-border",
  },
  {
    type: MemberType.ordinaryMember,
    labelEn: "Ordinary Members",
    labelHi: "सामान्य सदस्य",
    icon: <Users className="h-6 w-6" />,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
];

export default function MembersPage() {
  const { data: members, isLoading } = useGetMembers();
  const { t, language } = useLanguage();

  const getName = (name: { english: string; hindi: string }) =>
    language === "hindi"
      ? name.hindi || name.english
      : name.english || name.hindi;

  const getRole = (role: { english: string; hindi: string }) =>
    language === "hindi"
      ? role.hindi || role.english
      : role.english || role.hindi;

  const getInitials = (name: { english: string; hindi: string }) => {
    const n = name.english || name.hindi || "";
    return n
      .split(" ")
      .map((part: string) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === "hindi" ? "hi-IN" : "en-IN", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  const filterByType = (type: MemberType, allMembers: Member[]) =>
    allMembers.filter(
      (m) => (m.memberType ?? MemberType.ordinaryMember) === type,
    );

  const hasAnyMembers = members && members.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {t("Our Team Members", "हमारे सदस्य")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t(
              "Meet the dedicated individuals who are working to make a difference in our community.",
              "उन समर्पित लोगों से मिलें जो हमारे समुदाय में बदलाव लाने के लिए काम कर रहे हैं।",
            )}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((s) => (
              <div key={s}>
                <Skeleton
                  className="mb-6 h-8 w-48"
                  data-ocid="members.loading_state"
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((k) => (
                    <Card key={k}>
                      <CardContent className="flex flex-col items-center pt-8 pb-6">
                        <Skeleton className="mb-4 h-24 w-24 rounded-full" />
                        <Skeleton className="mb-2 h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : hasAnyMembers ? (
          <div className="space-y-14">
            {SECTION_CONFIG.map((section) => {
              const sectionMembers = filterByType(section.type, members!);
              if (sectionMembers.length === 0) return null;

              return (
                <section key={section.type}>
                  {/* Section heading */}
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {section.icon}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {t(section.labelEn, section.labelHi)}
                    </h2>
                    <span className="ml-1 rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                      {sectionMembers.length}
                    </span>
                  </div>

                  <div
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    data-ocid="members.list"
                  >
                    {sectionMembers.map((member, index) => (
                      <Card
                        key={member.id}
                        className="group overflow-hidden transition-shadow hover:shadow-md"
                        data-ocid={`members.item.${index + 1}`}
                      >
                        <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
                          <div className="mb-4 ring-4 ring-primary/10 rounded-full transition-all group-hover:ring-primary/30">
                            <Avatar className="h-24 w-24">
                              {member.photo ? (
                                <AvatarImage
                                  src={member.photo.getDirectURL()}
                                  alt={getName(member.name)}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <h3 className="mb-1 text-lg font-bold text-foreground">
                            {getName(member.name)}
                          </h3>

                          <Badge
                            variant="outline"
                            className={`mb-2 ${section.badgeClass}`}
                          >
                            {getRole(member.role)}
                          </Badge>

                          {member.joinDate && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>
                                {t("Joined", "जोड़ा गया")}{" "}
                                {formatDate(member.joinDate)}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="members.empty_state"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              {t("No members yet", "अभी तक कोई सदस्य नहीं")}
            </h3>
            <p className="text-muted-foreground">
              {t(
                "Member profiles will appear here once added.",
                "सदस्य प्रोफाइल जोड़ने के बाद यहाँ दिखाई देंगी।",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
