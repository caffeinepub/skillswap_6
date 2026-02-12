import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserId = Principal;
  type VideoId = Text;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<UserId, UserProfile>();
  let videos = Map.empty<VideoId, Video>();
  let watchHistory = Map.empty<UserId, List.List<WatchRecord>>();

  // Types
  type Video = {
    id : VideoId;
    title : Text;
    description : Text;
    category : Text;
    creator : UserId;
    videoFile : Storage.ExternalBlob;
  };

  type UserProfile = {
    id : UserId;
    name : Text;
    points : Nat;
  };

  type WatchRecord = {
    videoId : VideoId;
    timestamp : Time.Time;
  };

  // Required profile management functions per instructions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUserProfile(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let profile = {
      id = caller;
      name;
      points = 100;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadVideo(
    id : VideoId,
    title : Text,
    description : Text,
    category : Text,
    videoFile : Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload videos");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Video creator does not exist") };
      case (?_) {
        if (videos.containsKey(id)) {
          Runtime.trap("Video already exists with given id " # id);
        };
        let creator = caller;
        let video : Video = {
          id;
          title;
          description;
          category;
          creator;
          videoFile;
        };
        videos.add(id, video);
      };
    };
  };

  public shared ({ caller }) func watchVideo(videoId : VideoId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can watch videos");
    };
    let watchCost = 10;

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Learner does not exist") };
      case (?learner) {
        if (learner.points < watchCost) {
          Runtime.trap("Insufficient points to watch video");
        };

        switch (videos.get(videoId)) {
          case (null) { Runtime.trap("Video does not exist") };
          case (?video) {
            // Prevent watching own videos
            if (video.creator == caller) {
              Runtime.trap("Cannot watch your own video");
            };

            // Deduct points from learner and update userProfiles
            let updatedLearner = {
              id = learner.id;
              name = learner.name;
              points = learner.points - watchCost;
            };
            userProfiles.add(caller, updatedLearner);

            // Reward creator
            switch (userProfiles.get(video.creator)) {
              case (null) {
                Runtime.trap("Video creator did not exist");
              };
              case (?creator) {
                let updatedCreator : UserProfile = {
                  id = creator.id;
                  name = creator.name;
                  points = creator.points + watchCost;
                };
                userProfiles.add(video.creator, updatedCreator);
              };
            };

            // Record watch history
            addWatchHistory(caller, videoId);
          };
        };
      };
    };
  };

  func addWatchHistory(userId : UserId, videoId : VideoId) {
    let currentTime = Time.now();
    let watchRecord : WatchRecord = {
      videoId;
      timestamp = currentTime;
    };

    switch (watchHistory.get(userId)) {
      case (null) {
        let newList = List.empty<WatchRecord>();
        newList.add(watchRecord);
        watchHistory.add(userId, newList);
      };
      case (?existingHistory) {
        existingHistory.add(watchRecord);
      };
    };
  };

  public query ({ caller }) func getPointsBalance(userId : UserId) : async Nat {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own points balance");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile.points };
    };
  };

  func createProfileResponse(profile : UserProfile) : ProfileResponse {
    {
      name = profile.name;
      points = profile.points;
    };
  };

  func createVideoResponse(video : Video) : VideoResponse {
    {
      id = video.id;
      title = video.title;
      description = video.description;
      category = video.category;
      creator = video.creator;
      videoFile = video.videoFile;
    };
  };

  func createWatchRecordResponse(record : WatchRecord) : WatchRecordResponse {
    {
      videoId = record.videoId;
      timestamp = record.timestamp;
    };
  };

  // Public Read Functions
  public query ({ caller }) func getProfile() : async ProfileResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { createProfileResponse(profile) };
    };
  };

  public query ({ caller }) func getVideo(id : VideoId) : async VideoResponse {
    // Allow any user including guests to view video metadata
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        createVideoResponse(video);
      };
    };
  };

  public query ({ caller }) func getAllVideos() : async [VideoResponse] {
    // Allow any user including guests to browse videos
    videos.values().toArray().map(createVideoResponse);
  };

  public query ({ caller }) func getWatchHistory(userId : UserId) : async [WatchRecordResponse] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own watch history");
    };
    switch (watchHistory.get(userId)) {
      case (null) { [] };
      case (?history) {
        history.toArray().map(createWatchRecordResponse);
      };
    };
  };

  public query ({ caller }) func getProfileVideos(userId : UserId) : async [VideoResponse] {
    // Allow any user including guests to view someone's uploaded videos (public portfolio)
    videos.values().toArray().filter(
      func(video) { video.creator == userId }
    ).map(createVideoResponse);
  };

  // Public Types for Responses
  public type VideoResponse = {
    id : VideoId;
    title : Text;
    description : Text;
    category : Text;
    creator : UserId;
    videoFile : Storage.ExternalBlob;
  };

  public type ProfileResponse = {
    name : Text;
    points : Nat;
  };

  public type WatchRecordResponse = {
    videoId : VideoId;
    timestamp : Time.Time;
  };
};
