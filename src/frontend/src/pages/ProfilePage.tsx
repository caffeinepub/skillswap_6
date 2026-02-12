import AppLayout from '../components/Layout/AppLayout';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useCurrentUser';
import { useGetProfileVideos, useGetWatchHistory, useGetAllVideos } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Video, History, User, Award } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: uploadedVideos, isLoading: videosLoading } = useGetProfileVideos(
    identity?.getPrincipal().toString() || ''
  );
  const { data: watchHistory, isLoading: historyLoading } = useGetWatchHistory(
    identity?.getPrincipal().toString() || ''
  );
  const { data: allVideos } = useGetAllVideos();

  const isAuthenticated = !!identity;

  const getVideoTitle = (videoId: string) => {
    const video = allVideos?.find((v) => v.id === videoId);
    return video?.title || videoId;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isAuthenticated) {
    return (
      <AppLayout maxWidth="md">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout maxWidth="md">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile not found. Please complete your profile setup.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
                <CardDescription>Member since you joined</CardDescription>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                <Award className="h-5 w-5" />
                <span className="text-2xl font-bold">{userProfile.points.toString()}</span>
                <span className="text-sm">points</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="uploaded" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uploaded">
              <Video className="mr-2 h-4 w-4" />
              My Videos
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Watch History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploaded" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Videos</CardTitle>
                <CardDescription>Videos you've shared with the community</CardDescription>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !uploadedVideos || uploadedVideos.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven't uploaded any videos yet</p>
                    <Button onClick={() => navigate({ to: '/upload' })}>Upload Your First Video</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedVideos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{video.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: '/video/$videoId', params: { videoId: video.id } })}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Watch History</CardTitle>
                <CardDescription>Videos you've watched and learned from</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !watchHistory || watchHistory.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <History className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven't watched any videos yet</p>
                    <Button onClick={() => navigate({ to: '/' })}>Explore Videos</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Video</TableHead>
                        <TableHead>Watched On</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{getVideoTitle(record.videoId)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(record.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">-10 points</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
