import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AppLayout from '../components/Layout/AppLayout';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUploadVideo } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, Loader2, CheckCircle } from 'lucide-react';
import { ExternalBlob } from '../backend';

const CATEGORIES = ['Coding', 'Cooking', 'Design', 'Music', 'Fitness', 'Language', 'Art', 'Business', 'Other'];

export default function UploadPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const uploadVideo = useUploadVideo();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = !!identity;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrors({ ...errors, file: 'Please select a valid video file' });
        return;
      }
      setVideoFile(file);
      setErrors({ ...errors, file: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!videoFile) newErrors.file = 'Video file is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !videoFile) return;

    try {
      const videoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileBytes = new Uint8Array(await videoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadVideo.mutateAsync({
        id: videoId,
        title: title.trim(),
        description: description.trim(),
        category,
        videoFile: blob,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setVideoFile(null);
      setUploadProgress(0);

      // Navigate to home after short delay
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout maxWidth="md">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to upload videos.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (uploadVideo.isSuccess) {
    return (
      <AppLayout maxWidth="md">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold">Upload Successful!</h2>
              <p className="text-muted-foreground mt-2">Your video has been uploaded successfully.</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="md">
      <Card>
        <CardHeader>
          <CardTitle>Upload a Skill Video</CardTitle>
          <CardDescription>Share your knowledge and earn points when others watch</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to React Hooks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadVideo.isPending}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what viewers will learn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploadVideo.isPending}
                rows={4}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={uploadVideo.isPending}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">
                Video File <span className="text-destructive">*</span>
              </Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploadVideo.isPending}
              />
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
            </div>

            {uploadVideo.isPending && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {uploadVideo.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadVideo.error instanceof Error ? uploadVideo.error.message : 'Failed to upload video'}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={uploadVideo.isPending}>
              {uploadVideo.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
