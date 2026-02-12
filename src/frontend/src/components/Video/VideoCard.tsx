import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { Play, User } from 'lucide-react';
import type { VideoResponse } from '../../backend';

interface VideoCardProps {
  video: VideoResponse;
  creatorName?: string;
}

export default function VideoCard({ video, creatorName }: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{video.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {video.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{video.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-1.5 h-4 w-4" />
          <span className="truncate">{creatorName || video.creator.toString().slice(0, 8) + '...'}</span>
        </div>
        <Button
          onClick={() => navigate({ to: '/video/$videoId', params: { videoId: video.id } })}
          className="w-full"
        >
          <Play className="mr-2 h-4 w-4" />
          Watch Video
        </Button>
      </CardContent>
    </Card>
  );
}
