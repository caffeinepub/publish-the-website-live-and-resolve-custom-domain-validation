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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type Project } from "../../backend";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useAddProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProject,
} from "../../hooks/useQueries";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ProjectsManager() {
  const { data: projects, isLoading } = useGetProjects();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { language, t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    titleEnglish: "",
    titleHindi: "",
    descriptionEnglish: "",
    descriptionHindi: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      titleEnglish: "",
      titleHindi: "",
      descriptionEnglish: "",
      descriptionHindi: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setEditingProject(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      titleEnglish: project.title.english,
      titleHindi: project.title.hindi,
      descriptionEnglish: project.description.english,
      descriptionHindi: project.description.hindi,
    });
    if (project.image) {
      setImagePreview(project.image.getDirectURL());
    }
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        t(
          `Image is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          `छवि बहुत बड़ी है। अधिकतम आकार ${MAX_FILE_SIZE_MB}MB है।`,
        ),
      );
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageBlob: ExternalBlob | undefined = undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBlob = ExternalBlob.fromBytes(
          new Uint8Array(arrayBuffer),
        ).withUploadProgress((pct) => setUploadProgress(Math.round(pct)));
      } else if (!removeImage && editingProject?.image) {
        imageBlob = editingProject.image;
      }

      const projectData: Project = {
        id: editingProject?.id || Date.now().toString(),
        title: {
          english: formData.titleEnglish,
          hindi: formData.titleHindi,
        },
        description: {
          english: formData.descriptionEnglish,
          hindi: formData.descriptionHindi,
        },
        image: imageBlob,
      };

      if (editingProject) {
        await updateProject.mutateAsync(projectData);
        toast.success(
          t("Project updated successfully!", "परियोजना सफलतापूर्वक अपडेट की गई!"),
        );
      } else {
        await addProject.mutateAsync(projectData);
        toast.success(
          t("Project added successfully!", "परियोजना सफलतापूर्वक जोड़ी गई!"),
        );
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to save project: ${msg}`, `परियोजना सहेजने में विफल: ${msg}`),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t(
          "Are you sure you want to delete this project?",
          "क्या आप वाकई इस परियोजना को हटाना चाहते हैं?",
        ),
      )
    ) {
      return;
    }

    try {
      await deleteProject.mutateAsync(id);
      toast.success(
        t("Project deleted successfully!", "परियोजना सफलतापूर्वक हटाई गई!"),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to delete project: ${msg}`, `परियोजना हटाने में विफल: ${msg}`),
      );
    }
  };

  const getTitle = (title: { english: string; hindi: string }) => {
    return language === "english" ? title.english : title.hindi;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBusy = isUploading || addProject.isPending || updateProject.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("Projects Manager", "परियोजना प्रबंधक")}</CardTitle>
            <CardDescription>
              {t(
                "Add, edit, or delete projects",
                "परियोजनाएं जोड़ें, संपादित करें या हटाएं",
              )}
            </CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (isUploading) return;
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button data-ocid="projects.open_modal_button">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Project", "परियोजना जोड़ें")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject
                    ? t("Edit Project", "परियोजना संपादित करें")
                    : t("Add New Project", "नई परियोजना जोड़ें")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "Fill in the project details in both languages",
                    "दोनों भाषाओं में परियोजना विवरण भरें",
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Project Image", "परियोजना छवि")}</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt={t("Preview", "पूर्वावलोकन")}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={isBusy}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                          aria-label={t("Remove image", "छवि हटाएं")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div>
                      <Input
                        id="project-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isBusy}
                      />
                      <Label
                        htmlFor="project-image"
                        className={
                          isBusy
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }
                      >
                        <div
                          className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
                          data-ocid="projects.upload_button"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{t("Upload Image", "छवि अपलोड करें")}</span>
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
                  <div className="space-y-1" data-ocid="projects.loading_state">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {t("Uploading image…", "छवि अपलोड हो रहा है…")}
                      </span>
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
                      <Label htmlFor="titleEnglish">
                        {t("Title", "शीर्षक")}
                      </Label>
                      <Input
                        id="titleEnglish"
                        data-ocid="projects.input"
                        value={formData.titleEnglish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            titleEnglish: e.target.value,
                          })
                        }
                        required
                        disabled={isBusy}
                        placeholder="Enter project title in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionEnglish">
                        {t("Description", "विवरण")}
                      </Label>
                      <Textarea
                        id="descriptionEnglish"
                        value={formData.descriptionEnglish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionEnglish: e.target.value,
                          })
                        }
                        rows={5}
                        required
                        disabled={isBusy}
                        placeholder="Enter project description in English"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="hindi" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleHindi">{t("Title", "शीर्षक")}</Label>
                      <Input
                        id="titleHindi"
                        value={formData.titleHindi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            titleHindi: e.target.value,
                          })
                        }
                        required
                        disabled={isBusy}
                        placeholder="हिंदी में परियोजना शीर्षक दर्ज करें"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionHindi">
                        {t("Description", "विवरण")}
                      </Label>
                      <Textarea
                        id="descriptionHindi"
                        value={formData.descriptionHindi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionHindi: e.target.value,
                          })
                        }
                        rows={5}
                        required
                        disabled={isBusy}
                        placeholder="हिंदी में परियोजना विवरण दर्ज करें"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isBusy}
                    data-ocid="projects.save_button"
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
                    data-ocid="projects.cancel_button"
                  >
                    {t("Cancel", "रद्द करें")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projects && projects.length > 0 ? (
          <div className="space-y-4" data-ocid="projects.list">
            {projects.map((project, idx) => (
              <Card key={project.id} data-ocid={`projects.item.${idx + 1}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {project.image && (
                      <img
                        src={project.image.getDirectURL()}
                        alt={getTitle(project.title)}
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {getTitle(project.title)}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(project)}
                      aria-label={t("Edit", "संपादित करें")}
                      data-ocid={`projects.edit_button.${idx + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteProject.isPending}
                      aria-label={t("Delete", "हटाएं")}
                      data-ocid={`projects.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p
            className="text-center text-muted-foreground"
            data-ocid="projects.empty_state"
          >
            {t("No projects yet", "अभी तक कोई परियोजनाएं नहीं")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
