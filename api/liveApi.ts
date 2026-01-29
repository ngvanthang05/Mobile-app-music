import { liveClient } from "./baseApi";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LiveRoom {
  roomId: string;
  roomTitle: string;
  streamer: string;
  streamerName: string;  // Display name for the streamer
  viewerCount: number;
  thumbnailUrl: string;
  streamUrl: string;
  category?: string;
  isLive: boolean;
}

export interface LivestreamRecording {
  recordingId: string;
  roomTitle: string;
  videoUri: string;              // Local file path
  duration: number;              // Duration in seconds
  recordedAt: string;            // ISO timestamp
  thumbnailUri?: string;         // Optional thumbnail
  fileSize?: number;             // File size in bytes
}

export interface StartBroadcastRequest {
  hostId: string;
  hostName: string;
  roomTitle: string;
  thumbnailUrl?: string;
}

export const liveApi = {
  // Lấy danh sách phòng đang phát sóng
  getBroadcastingRooms: async (): Promise<LiveRoom[]> => {
    const res = await liveClient.get("/broadcasting");
    return res.data;
  },

  // Bắt đầu phát sóng
  startBroadcast: async (roomData: StartBroadcastRequest) => {
    const res = await liveClient.post("/start", roomData);
    return res.data;
  },

  // Kết thúc phát sóng
  endBroadcast: async (roomId: string) => {
    const res = await liveClient.post(`/end/${roomId}`);
    return res.data;
  },

  // Tham gia phòng (xem livestream)
  joinRoom: async (roomId: string, userId: string) => {
    const res = await liveClient.post(`/join/${roomId}`, { userId });
    return res.data;
  },

  // Rời khỏi phòng
  leaveRoom: async (roomId: string, userId: string) => {
    const res = await liveClient.post(`/leave/${roomId}`, { userId });
    return res.data;
  },

  // Lấy danh sách phòng đang live (legacy - giữ lại để tương thích)
  getActiveRooms: async (): Promise<LiveRoom[]> => {
    const res = await liveClient.get("/active");
    return res.data;
  },

  // Bắt đầu live (legacy)
  startLive: async (roomData: StartBroadcastRequest) => {
    const res = await liveClient.post("/start", roomData);
    return res.data;
  },

  // Kết thúc live (legacy)
  endLive: async (roomId: string) => {
    const res = await liveClient.post(`/end/${roomId}`);
    return res.data;
  },

  // Recording management
  getRecordingHistory: async (): Promise<LivestreamRecording[]> => {
    try {
      const data = await AsyncStorage.getItem('@livestream_recordings');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recordings:', error);
      return [];
    }
  },

  saveRecording: async (recording: LivestreamRecording): Promise<void> => {
    try {
      const recordings = await liveApi.getRecordingHistory();
      recordings.unshift(recording); // Add to beginning
      await AsyncStorage.setItem('@livestream_recordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recording:', error);
      throw error;
    }
  },

  deleteRecording: async (recordingId: string): Promise<void> => {
    try {
      const recordings = await liveApi.getRecordingHistory();
      const filtered = recordings.filter(r => r.recordingId !== recordingId);
      await AsyncStorage.setItem('@livestream_recordings', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  }
};
