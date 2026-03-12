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
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type GalleryImage } from "../../backend";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useAddGalleryImage,
  useDeleteGalleryImage,
  useGetGalleryImages,
} from "../../hooks/useQueries";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function GalleryManager() {
  const { data: galleryImages, isLoading } = useGetGalleryImages();
  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const { language, t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [captionEnglish, setCaptionEnglish] = useState("");
  const [captionHindi, setCaptionHindi] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setCaptionEnglish("");
    setCaptionHindi("");
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error(t("Please select an image", "कृपया एक छवि चुनें"));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBlob = ExternalBlob.fromBytes(
        new Uint8Array(arrayBuffer),
      ).withUploadProgress((pct) => setUploadProgress(Math.round(pct)));

      const galleryImage: GalleryImage = {
        id: Date.now().toString(),
        image: imageBlob,
        caption: {
          english: captionEnglish,
          hindi: captionHindi,
        },
      };

      await addImage.mutateAsync(galleryImage);
      toast.success(t("Image added successfully!", "छवि सफलतापूर्वक जोड़ी गई!"));
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to upload image: ${msg}`, `छवि अपलोड में विफल: ${msg}`),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t(
          "Are you sure you want to delete this image?",
          "क्या आप वाकई इस छवि को हटाना चाहते हैं?",
        ),
      )
    ) {
      return;
    }

    try {
      await deleteImage.mutateAsync(id);
      toast.success(t("Image deleted successfully!", "छवि सफलतापूर्वक हटाई गई!"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        t(`Failed to delete image: ${msg}`, `छवि हटाने में विफल: ${msg}`),
      );
    }
  };

  const getCaption = (caption: { english: string; hindi: string }) => {
    return language === "english" ? caption.english : caption.hindi;
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("Gallery Manager", "गैलरी प्रबंधक")}</CardTitle>
            <CardDescription>
              {t(
                "Upload and manage gallery images",
                "गैलरी छवियां अपलोड और प्रबंधित करें",
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
              <Button data-ocid="gallery.open_modal_button">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Image", "छवि जोड़ें")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("Add Gallery Image", "गैलरी छवि जोड़ें")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    `Upload an image (max ${MAX_FILE_SIZE_MB}MB) and add captions`,
                    `एक छवि अपलोड करें (अधिकतम ${MAX_FILE_SIZE_MB}MB) और कैप्शन जोड़ें`,
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Image", "छवि")}</Label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt={t("Preview", "पूर्वावलोकन")}
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  )}
                  <Input
                    id="gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Label
                    htmlFor="gallery-image"
                    className={
                      isUploading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    <div
                      className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-8 hover:bg-accent"
                      data-ocid="gallery.dropzone"
                    >
                      <Upload className="h-6 w-6" />
                      <span>
                        {imageFile
                          ? imageFile.name
                          : t(
                              "Click to upload image",
                              "छवि अपलोड करने के लिए क्लिक करें",
                            )}
                      </span>
                    </div>
                  </Label>
                </div>

                {isUploading && (
                  <div className="space-y-1" data-ocid="gallery.loading_state">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("Uploading…", "अपलोड हो रहा है…")}</span>
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
                      <Label htmlFor="captionEnglish">
                        {t("Caption (Optional)", "कैप्शन (वैकल्पिक)")}
                      </Label>
                      <Input
                        id="captionEnglish"
                        data-ocid="gallery.input"
                        value={captionEnglish}
                        onChange={(e) => setCaptionEnglish(e.target.value)}
                        placeholder="Enter caption in English"
                        disabled={isUploading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="hindi" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="captionHindi">
                        {t("Caption (Optional)", "कैप्शन (वैकल्पिक)")}
                      </Label>
                      <Input
                        id="captionHindi"
                        value={captionHindi}
                        onChange={(e) => setCaptionHindi(e.target.value)}
                        placeholder="हिंदी में कैप्शन दर्ज करें"
                        disabled={isUploading}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isUploading || addImage.isPending}
                    data-ocid="gallery.submit_button"
                  >
                    {isUploading || addImage.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Uploading…", "अपलोड हो रहा है…")}
                      </>
                    ) : (
                      t("Upload", "अपलोड करें")
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isUploading}
                    data-ocid="gallery.cancel_button"
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
        {galleryImages && galleryImages.length > 0 ? (
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            data-ocid="gallery.list"
          >
            {galleryImages.map((image, idx) => (
              <Card
                key={image.id}
                className="overflow-hidden"
                data-ocid={`gallery.item.${idx + 1}`}
              >
                <CardContent className="p-0">
                  <img
                    src={image.image.getDirectURL()}
                    alt={
                      getCaption(image.caption) ||
                      t("Gallery image", "गैलरी छवि")
                    }
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    {image.caption && (
                      <p className="mb-2 text-sm text-muted-foreground">
                        {getCaption(image.caption)}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteImage.isPending}
                      className="w-full"
                      data-ocid={`gallery.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("Delete", "हटाएं")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p
            className="text-center text-muted-foreground"
            data-ocid="gallery.empty_state"
          >
            {t("No images in gallery yet", "अभी तक गैलरी में कोई छवियां नहीं")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
