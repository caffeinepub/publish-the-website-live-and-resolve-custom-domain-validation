import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetGalleryImages, useAddGalleryImage, useDeleteGalleryImage } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';
import { ExternalBlob, type GalleryImage } from '../../backend';
import { useLanguage } from '../../contexts/LanguageContext';

export default function GalleryManager() {
  const { data: galleryImages, isLoading } = useGetGalleryImages();
  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const { language, t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [captionEnglish, setCaptionEnglish] = useState('');
  const [captionHindi, setCaptionHindi] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const resetForm = () => {
    setCaptionEnglish('');
    setCaptionHindi('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error(t('Please select an image', 'कृपया एक छवि चुनें'));
      return;
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBlob = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));

      const galleryImage: GalleryImage = {
        id: Date.now().toString(),
        image: imageBlob,
        caption: {
          english: captionEnglish,
          hindi: captionHindi,
        },
      };

      await addImage.mutateAsync(galleryImage);
      toast.success(t('Image added successfully!', 'छवि सफलतापूर्वक जोड़ी गई!'));
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t('Failed to add image', 'छवि जोड़ने में विफल'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this image?', 'क्या आप वाकई इस छवि को हटाना चाहते हैं?'))) {
      return;
    }

    try {
      await deleteImage.mutateAsync(id);
      toast.success(t('Image deleted successfully!', 'छवि सफलतापूर्वक हटाई गई!'));
    } catch (error) {
      toast.error(t('Failed to delete image', 'छवि हटाने में विफल'));
    }
  };

  const getCaption = (caption: { english: string; hindi: string }) => {
    return language === 'english' ? caption.english : caption.hindi;
  };

  if (isLoading) {
    return <div>{t('Loading...', 'लोड हो रहा है...')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('Gallery Manager', 'गैलरी प्रबंधक')}</CardTitle>
            <CardDescription>{t('Upload and manage gallery images', 'गैलरी छवियां अपलोड और प्रबंधित करें')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Image', 'छवि जोड़ें')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Add Gallery Image', 'गैलरी छवि जोड़ें')}</DialogTitle>
                <DialogDescription>
                  {t('Upload an image and add captions in both languages', 'एक छवि अपलोड करें और दोनों भाषाओं में कैप्शन जोड़ें')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('Image', 'छवि')}</Label>
                  {imagePreview && (
                    <img src={imagePreview} alt={t('Preview', 'पूर्वावलोकन')} className="h-48 w-full rounded-lg object-cover" />
                  )}
                  <Input
                    id="gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                  <Label htmlFor="gallery-image" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-8 hover:bg-accent">
                      <Upload className="h-6 w-6" />
                      <span>{t('Click to upload image', 'छवि अपलोड करने के लिए क्लिक करें')}</span>
                    </div>
                  </Label>
                </div>

                <Tabs defaultValue="english" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
                    <TabsTrigger value="hindi">🇮🇳 हिंदी</TabsTrigger>
                  </TabsList>

                  <TabsContent value="english" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="captionEnglish">{t('Caption (Optional)', 'कैप्शन (वैकल्पिक)')}</Label>
                      <Input
                        id="captionEnglish"
                        value={captionEnglish}
                        onChange={(e) => setCaptionEnglish(e.target.value)}
                        placeholder="Enter caption in English"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="hindi" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="captionHindi">{t('Caption (Optional)', 'कैप्शन (वैकल्पिक)')}</Label>
                      <Input
                        id="captionHindi"
                        value={captionHindi}
                        onChange={(e) => setCaptionHindi(e.target.value)}
                        placeholder="हिंदी में कैप्शन दर्ज करें"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button type="submit" disabled={addImage.isPending}>
                    {addImage.isPending ? t('Uploading...', 'अपलोड हो रहा है...') : t('Upload', 'अपलोड करें')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('Cancel', 'रद्द करें')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {galleryImages && galleryImages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={image.image.getDirectURL()}
                    alt={getCaption(image.caption) || t('Gallery image', 'गैलरी छवि')}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    {image.caption && (
                      <p className="mb-2 text-sm text-muted-foreground">{getCaption(image.caption)}</p>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteImage.isPending}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('Delete', 'हटाएं')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t('No images in gallery yet', 'अभी तक गैलरी में कोई छवियां नहीं')}</p>
        )}
      </CardContent>
    </Card>
  );
}
