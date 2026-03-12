import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Pencil, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type Member, MemberType } from "../../backend";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useAddMember,
  useDeleteMember,
  useGetMembers,
  useUpdateMember,
} from "../../hooks/useQueries";

const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface MemberFormData {
  nameEnglish: string;
  nameHindi: string;
  roleEnglish: string;
  roleHindi: string;
  joinDate: string;
  memberType: MemberType;
}

const makeEmptyForm = (
  memberType: MemberType = MemberType.coreCommittee,
): MemberFormData => ({
  nameEnglish: "",
  nameHindi: "",
  roleEnglish: "",
  roleHindi: "",
  joinDate: "",
  memberType,
});

const MEMBER_TYPE_LABELS: Record<MemberType, { en: string; hi: string }> = {
  [MemberType.coreCommittee]: {
    en: "Core Committee Member",
    hi: "मुख्य समिति सदस्य",
  },
  [MemberType.mainMember]: { en: "Main Member", hi: "मुख्य सदस्य" },
  [MemberType.ordinaryMember]: { en: "Ordinary Member", hi: "सामान्य सदस्य" },
};

export default function MembersManager() {
  const { data: members, isLoading } = useGetMembers();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const { language, t } = useLanguage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(makeEmptyForm());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = (type: MemberType = MemberType.coreCommittee) => {
    setFormData(makeEmptyForm(type));
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
    setEditingMember(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleAddForType = (type: MemberType) => {
    resetForm(type);
    setIsDialogOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      nameEnglish: member.name.english,
      nameHindi: member.name.hindi,
      roleEnglish: member.role.english,
      roleHindi: member.role.hindi,
      joinDate: member.joinDate,
      memberType: member.memberType ?? MemberType.ordinaryMember,
    });
    if (member.photo) {
      setPhotoPreview(member.photo.getDirectURL());
    } else {
      setPhotoPreview(null);
    }
    setRemovePhoto(false);
    setIsDialogOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        t(
          `Photo is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          `फोटो बहुत बड़ी है। अधिकतम आकार ${MAX_FILE_SIZE_MB}MB है।`,
        ),
      );
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEnglish.trim() && !formData.nameHindi.trim()) {
      toast.error(t("Please enter the member name", "कृपया सदस्य का नाम दर्ज करें"));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let photoBlob: ExternalBlob | undefined = undefined;

      if (photoFile) {
        const arrayBuffer = await photoFile.arrayBuffer();
        photoBlob = ExternalBlob.fromBytes(
          new Uint8Array(arrayBuffer),
        ).withUploadProgress((pct) => setUploadProgress(Math.round(pct)));
      } else if (!removePhoto && editingMember?.photo) {
        photoBlob = editingMember.photo;
      }

      const memberData: Member = {
        id: editingMember?.id || Date.now().toString(),
        name: {
          english: formData.nameEnglish,
          hindi: formData.nameHindi,
        },
        role: {
          english: formData.roleEnglish,
          hindi: formData.roleHindi,
        },
        joinDate: formData.joinDate,
        memberType: formData.memberType,
        photo: photoBlob,
      };

      if (editingMember) {
        await updateMember.mutateAsync(memberData);
        toast.success(
          t("Member updated successfully!", "सदस्य सफलतापूर्वक अपडेट किया गया!"),
        );
      } else {
        await addMember.mutateAsync(memberData);
        toast.success(
          t("Member added successfully!", "सदस्य सफलतापूर्वक जोड़ा गया!"),
        );
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to save member: ${msg}`, `सदस्य सहेजने में विफल: ${msg}`),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteMember.mutateAsync(deleteConfirmId);
      toast.success(
        t("Member deleted successfully!", "सदस्य सफलतापूर्वक हटाया गया!"),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to delete member: ${msg}`, `सदस्य हटाने में विफल: ${msg}`),
      );
    } finally {
      setDeleteConfirmId(null);
    }
  };

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
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getMemberTypeLabel = (type: MemberType) => {
    const labels = MEMBER_TYPE_LABELS[type];
    return language === "hindi" ? labels.hi : labels.en;
  };

  const filterByType = (type: MemberType) =>
    (members ?? []).filter(
      (m) => (m.memberType ?? MemberType.ordinaryMember) === type,
    );

  const MemberCard = ({ member, index }: { member: Member; index: number }) => (
    <Card key={member.id} data-ocid={`members.item.${index + 1}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {member.photo ? (
              <AvatarImage
                src={member.photo.getDirectURL()}
                alt={getName(member.name)}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{getName(member.name)}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {getRole(member.role)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(member)}
            aria-label={t("Edit", "संपादित करें")}
            data-ocid={`members.edit_button.${index + 1}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(member.id)}
            disabled={deleteMember.isPending}
            aria-label={t("Delete", "हटाएं")}
            data-ocid={`members.delete_button.${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TabMemberList = ({
    type,
    ocidAdd,
  }: {
    type: MemberType;
    ocidAdd: string;
  }) => {
    const filtered = filterByType(type);
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => handleAddForType(type)} data-ocid={ocidAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Add Member", "सदस्य जोड़ें")}
          </Button>
        </div>
        {filtered.length > 0 ? (
          <div className="space-y-3" data-ocid="members.list">
            {filtered.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center" data-ocid="members.empty_state">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {t(
                `No ${MEMBER_TYPE_LABELS[type].en}s added yet`,
                `अभी तक कोई ${MEMBER_TYPE_LABELS[type].hi} नहीं जोड़ा गया`,
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBusy = isUploading || addMember.isPending || updateMember.isPending;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("Members Manager", "सदस्य प्रबंधक")}
          </CardTitle>
          <CardDescription>
            {t(
              "Add, edit, and manage organization members by category",
              "श्रेणी के अनुसार संगठन के सदस्यों को जोड़ें, संपादित करें और प्रबंधित करें",
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="coreCommittee" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="coreCommittee" data-ocid="members.tab">
                {t("Core Committee", "मुख्य समिति")}
              </TabsTrigger>
              <TabsTrigger value="mainMember" data-ocid="members.tab">
                {t("Main Member", "मुख्य सदस्य")}
              </TabsTrigger>
              <TabsTrigger value="ordinaryMember" data-ocid="members.tab">
                {t("Ordinary Member", "सामान्य सदस्य")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coreCommittee">
              <TabMemberList
                type={MemberType.coreCommittee}
                ocidAdd="members.core_committee.open_modal_button"
              />
            </TabsContent>

            <TabsContent value="mainMember">
              <TabMemberList
                type={MemberType.mainMember}
                ocidAdd="members.main_member.open_modal_button"
              />
            </TabsContent>

            <TabsContent value="ordinaryMember">
              <TabMemberList
                type={MemberType.ordinaryMember}
                ocidAdd="members.ordinary_member.open_modal_button"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add / Edit Member Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (isUploading) return;
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="members.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingMember
                ? t("Edit Member", "सदस्य संपादित करें")
                : t("Add New Member", "नया सदस्य जोड़ें")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Fill in member details in both languages",
                "दोनों भाषाओं में सदस्य विवरण भरें",
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Type */}
            <div className="space-y-2">
              <Label htmlFor="member-type">
                {t("Member Category", "सदस्य श्रेणी")}
              </Label>
              <Select
                value={formData.memberType}
                onValueChange={(value) =>
                  setFormData({ ...formData, memberType: value as MemberType })
                }
                disabled={isBusy}
              >
                <SelectTrigger id="member-type" data-ocid="members.select">
                  <SelectValue placeholder={t("Select category", "श्रेणी चुनें")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MemberType.coreCommittee}>
                    {getMemberTypeLabel(MemberType.coreCommittee)}
                  </SelectItem>
                  <SelectItem value={MemberType.mainMember}>
                    {getMemberTypeLabel(MemberType.mainMember)}
                  </SelectItem>
                  <SelectItem value={MemberType.ordinaryMember}>
                    {getMemberTypeLabel(MemberType.ordinaryMember)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label>{t("Member Photo", "सदस्य फोटो")}</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photoPreview} />
                      <AvatarFallback>
                        {getInitials({
                          english: formData.nameEnglish,
                          hindi: formData.nameHindi,
                        })}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isBusy}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                      aria-label={t("Remove photo", "फोटो हटाएं")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <Users className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <Input
                    id="member-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isBusy}
                  />
                  <Label
                    htmlFor="member-photo"
                    className={
                      isBusy
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    <div
                      className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                      data-ocid="members.upload_button"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{t("Upload Photo", "फोटो अपलोड करें")}</span>
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

              {isUploading && (
                <div className="space-y-1" data-ocid="members.loading_state">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("Uploading photo…", "फोटो अपलोड हो रहा है…")}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            {/* Name & Role tabs */}
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="hindi">🇮🇳 हिंदी</TabsTrigger>
              </TabsList>
              <TabsContent value="english" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name-en">
                    {t("Name (English)", "नाम (अंग्रेज़ी)")}
                  </Label>
                  <Input
                    id="name-en"
                    data-ocid="members.input"
                    value={formData.nameEnglish}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameEnglish: e.target.value,
                      })
                    }
                    disabled={isBusy}
                    placeholder="Enter member name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-en">
                    {t("Role / Designation (English)", "भूमिका / पदनाम (अंग्रेज़ी)")}
                  </Label>
                  <Input
                    id="role-en"
                    value={formData.roleEnglish}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roleEnglish: e.target.value,
                      })
                    }
                    disabled={isBusy}
                    placeholder="e.g. President, Secretary"
                  />
                </div>
              </TabsContent>
              <TabsContent value="hindi" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name-hi">
                    {t("Name (Hindi)", "नाम (हिंदी)")}
                  </Label>
                  <Input
                    id="name-hi"
                    value={formData.nameHindi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameHindi: e.target.value,
                      })
                    }
                    disabled={isBusy}
                    placeholder="हिंदी में सदस्य का नाम दर्ज करें"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-hi">
                    {t("Role / Designation (Hindi)", "भूमिका / पदनाम (हिंदी)")}
                  </Label>
                  <Input
                    id="role-hi"
                    value={formData.roleHindi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roleHindi: e.target.value,
                      })
                    }
                    disabled={isBusy}
                    placeholder="जैसे: अध्यक्ष, सचिव"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Join Date */}
            <div className="space-y-2">
              <Label htmlFor="join-date">
                {t("Join Date", "शामिल होने की तारीख")}
              </Label>
              <Input
                id="join-date"
                type="date"
                value={formData.joinDate}
                onChange={(e) =>
                  setFormData({ ...formData, joinDate: e.target.value })
                }
                disabled={isBusy}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isBusy}
                data-ocid="members.save_button"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Saving…", "सहेजा जा रहा है…")}
                  </>
                ) : (
                  t("Save", "सहेजें")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isBusy}
                data-ocid="members.cancel_button"
              >
                {t("Cancel", "रद्द करें")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent data-ocid="members.dialog">
          <DialogHeader>
            <DialogTitle>{t("Delete Member", "सदस्य हटाएं")}</DialogTitle>
            <DialogDescription>
              {t(
                "Are you sure you want to delete this member? This action cannot be undone.",
                "क्या आप वाकई इस सदस्य को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="members.cancel_button"
            >
              {t("Cancel", "रद्द करें")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMember.isPending}
              data-ocid="members.confirm_button"
            >
              {deleteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Deleting…", "हटाया जा रहा है…")}
                </>
              ) : (
                t("Delete", "हटाएं")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
