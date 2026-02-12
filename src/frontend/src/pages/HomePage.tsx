import { useState, useMemo } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import VideoCard from '../components/Video/VideoCard';
import { useGetAllVideos } from '../hooks/useQueries';
import { useGetAllUserProfiles } from '../hooks/useCurrentUser';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Video } from 'lucide-react';

const CATEGORIES = ['All', 'Coding', 'Cooking', 'Design', 'Music', 'Fitness', 'Language', 'Art', 'Business', 'Other'];

export default function HomePage() {
  const { data: videos, isLoading } = useGetAllVideos();
  const { data: userProfiles } = useGetAllUserProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos = useMemo(() => {
    if (!videos) return [];

    return videos.filter((video) => {
      const matchesSearch =
        searchQuery === '' ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, selectedCategory]);

  const getCreatorName = (creatorId: string) => {
    const profile = userProfiles?.find((p) => p.id.toString() === creatorId);
    return profile?.name;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Discover Skills</h1>
          <p className="text-lg text-muted-foreground">
            Learn from others and share your expertise
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No videos found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your filters'
                : 'Be the first to upload a video!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} creatorName={getCreatorName(video.creator.toString())} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
