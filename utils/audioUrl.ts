import { BASE_URL } from "../api/baseApi";

export const fixStreamUrl = (url: string) => {
  if (!url) return url;

  return url
    .replace("backend-jfn4.onrender.com", BASE_URL)
    // .replace("http://192.168.101.136:8081", BASE_URL);
};
