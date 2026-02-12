import { useParams, useNavigate } from '@tanstack/react-router';
import AppLayout from '../components/Layout/AppLayout';
import WatchButton from '../components/Video/WatchButton';
import { useGetVideo, useGetAllVideos } from '../hooks/useQueries';
import { useGetAllUserProfiles } from '../hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Award } from 'lucide-react';
import { useState } from 'react';

export default function VideoDetailPage() {
  const { videoId } = useParams({ from: '/video/$videoId' });
  const navigate = useNavigate();
  const { data: video, isLoading, refetch } = useGetVideo(videoId);
  const { data: userProfiles } = useGetAllUserProfiles();
  const [hasWatched, setHasWatched] = useState(false);

  const creatorProfile = userProfiles?.find((p) => p.id.toString() === video?.creator.toString());

  const handleWatchSuccess = () => {
    setHasWatched(true);
    refetch();
  };

  if (isLoading) {
    return (
      <AppLayout maxWidth="lg">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!video) {
    return (
      <AppLayout maxWidth="md">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Video not found</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const videoUrl = video.videoFile.getDirectURL();

  return (
    <AppLayout maxWidth="lg">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Videos
        </Button>

        {/* Video Player */}
        <Card>
          <CardContent className="p-0">
            <video
              controls
              className="w-full aspect-video bg-black rounded-t-lg"
              src={videoUrl}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23000' width='100' height='100'/%3E%3C/svg%3E"
            >
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>

        {/* Video Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-2xl">{video.title}</CardTitle>
                    <Badge variant="secondary">{video.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{video.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {creatorProfile?.name || video.creator.toString().slice(0, 8) + '...'}
                    </p>
                    {creatorProfile && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Award className="mr-1 h-3 w-3" />
                        <span>{creatorProfile.points.toString()} points</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watch Action */}
            {!hasWatched && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Watch This Video</CardTitle>
                  <CardDescription>Costs 10 points to watch</CardDescription>
                </CardHeader>
                <CardContent>
                  <WatchButton video={video} onWatchSuccess={handleWatchSuccess} />
                </CardContent>
              </Card>
            )}

            {hasWatched && (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6 text-center space-y-2">
                  <p className="font-medium text-green-600 dark:text-green-400">✓ Watched</p>
                  <p className="text-sm text-muted-foreground">You've watched this video</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
