import { Button } from '@/components/ui/button';
import { useWatchVideo } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUser';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2, Play, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { VideoResponse } from '../../backend';

interface WatchButtonProps {
  video: VideoResponse;
  onWatchSuccess?: () => void;
}

export default function WatchButton({ video, onWatchSuccess }: WatchButtonProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const watchVideo = useWatchVideo();

  const isAuthenticated = !!identity;
  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnVideo = currentUserPrincipal === video.creator.toString();
  const hasInsufficientPoints = userProfile && Number(userProfile.points) < 10;

  const handleWatch = async () => {
    try {
      await watchVideo.mutateAsync(video.id);
      onWatchSuccess?.();
    } catch (error: any) {
      console.error('Watch error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please log in to watch videos.</AlertDescription>
      </Alert>
    );
  }

  if (isOwnVideo) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>You cannot watch your own video.</AlertDescription>
      </Alert>
    );
  }

  if (hasInsufficientPoints) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need at least 10 points to watch this video. Upload your own videos to earn more points!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button onClick={handleWatch} disabled={watchVideo.isPending} size="lg" className="w-full">
      {watchVideo.isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-5 w-5" />
          Watch Video (10 points)
        </>
      )}
    </Button>
  );
}
