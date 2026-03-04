import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetHomepageImages, useAddHomepageImage, useDeleteHomepageImage } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';
import { ExternalBlob, type GalleryImage } from '../../backend';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HomePageImagesManager() {
  const { data: homepageImages, isLoading } = useGetHomepageImages();
  const addImage = useAddHomepageImage();
  const deleteImage = useDeleteHomepageImage();
  const { language } = useLanguage();
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
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBlob = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));

      const homepageImage: GalleryImage = {
        id: Date.now().toString(),
        image: imageBlob,
        caption: {
          english: captionEnglish,
          hindi: captionHindi,
        },
      };

      await addImage.mutateAsync(homepageImage);
      toast.success('Image added successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteImage.mutateAsync(id);
      toast.success('Image deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const getCaption = (caption: { english: string; hindi: string }) => {
    return language === 'english' ? caption.english : caption.hindi;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Home Page Images</CardTitle>
            <CardDescription>Upload and manage images that appear on the home page</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Home Page Image</DialogTitle>
                <DialogDescription>
                  Upload an image and add captions in both languages
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Image</Label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
                  )}
                  <Input
                    id="homepage-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                  <Label htmlFor="homepage-image" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-8 hover:bg-accent">
                      <Upload className="h-6 w-6" />
                      <span>Click to upload image</span>
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
                      <Label htmlFor="captionEnglish">Caption (Optional)</Label>
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
                      <Label htmlFor="captionHindi">Caption (Optional)</Label>
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
                    {addImage.isPending ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {homepageImages && homepageImages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homepageImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={image.image.getDirectURL()}
                    alt={getCaption(image.caption) || 'Home page image'}
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
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No images on home page yet</p>
        )}
      </CardContent>
    </Card>
  );
}
