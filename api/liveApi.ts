import { liveClient } from "./baseApi";

export interface LiveRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  roomTitle: string;
  startedAt?: string;
}

export interface StartLiveRequest {
  roomId: string;
  hostId: string;
  hostName: string;
  roomTitle: string;
}

export const liveApi = {
  // Lấy danh sách phòng đang live
  getActiveRooms: async (): Promise<LiveRoom[]> => {
    const res = await liveClient.get("/active");
    return res.data;
  },

  // Bắt đầu live
  startLive: async (roomData: StartLiveRequest) => {
    const res = await liveClient.post("/start", roomData);
    return res.data;
  },

  // Kết thúc live
  endLive: async (roomId: string) => {
    const res = await liveClient.post(`/end/${roomId}`);
    return res.data;
  }
};
