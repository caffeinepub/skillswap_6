import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    id: UserId;
    name: string;
    points: bigint;
}
export type UserId = Principal;
export type Time = bigint;
export type VideoId = string;
export interface WatchRecordResponse {
    timestamp: Time;
    videoId: VideoId;
}
export interface ProfileResponse {
    name: string;
    points: bigint;
}
export interface VideoResponse {
    id: VideoId;
    title: string;
    creator: UserId;
    description: string;
    videoFile: ExternalBlob;
    category: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserProfile(name: string): Promise<void>;
    getAllVideos(): Promise<Array<VideoResponse>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPointsBalance(userId: UserId): Promise<bigint>;
    getProfile(): Promise<ProfileResponse>;
    getProfileVideos(userId: UserId): Promise<Array<VideoResponse>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: VideoId): Promise<VideoResponse>;
    getWatchHistory(userId: UserId): Promise<Array<WatchRecordResponse>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadVideo(id: VideoId, title: string, description: string, category: string, videoFile: ExternalBlob): Promise<void>;
    watchVideo(videoId: VideoId): Promise<void>;
}
