import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { VideoResponse, WatchRecordResponse, ExternalBlob } from '../backend';
import { toast } from 'sonner';

export function useGetAllVideos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoResponse[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetVideo(videoId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoResponse>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !actorFetching && !!videoId,
  });
}

export function useGetProfileVideos(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoResponse[]>({
    queryKey: ['profileVideos', userId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = { toString: () => userId } as any;
      return actor.getProfileVideos(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetWatchHistory(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WatchRecordResponse[]>({
    queryKey: ['watchHistory', userId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = { toString: () => userId } as any;
      return actor.getWatchHistory(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createUserProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile created successfully! You now have 100 points.');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create profile';
      toast.error(message);
    },
  });
}

export function useUploadVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      category,
      videoFile,
    }: {
      id: string;
      title: string;
      description: string;
      category: string;
      videoFile: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadVideo(id, title, description, category, videoFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['profileVideos'] });
      toast.success('Video uploaded successfully!');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to upload video';
      toast.error(message);
    },
  });
}

export function useWatchVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.watchVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
      queryClient.invalidateQueries({ queryKey: ['video'] });
      toast.success('Video watched! 10 points transferred to the creator.');
    },
    onError: (error: any) => {
      let message = 'Failed to watch video';
      if (error.message) {
        if (error.message.includes('Insufficient points')) {
          message = 'You need at least 10 points to watch this video.';
        } else if (error.message.includes('own video')) {
          message = 'You cannot watch your own video.';
        } else {
          message = error.message;
        }
      }
      toast.error(message);
    },
  });
}
