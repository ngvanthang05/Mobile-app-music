# 🎵 Music Streaming App - React Native Expo

Ứng dụng streaming music mobile với giao diện hiện đại, màu sắc xanh ombre (blue-cyan gradient).

## ✨ Tính năng

- 🏠 **Home Screen**: Hiển thị bài hát gần đây và playlists
- 🔍 **Search Screen**: Tìm kiếm bài hát, nghệ sĩ, album và duyệt thể loại
- 📚 **Library Screen**: Quản lý toàn bộ thư viện nhạc
- 👑 **Premium Screen**: Hiển thị các tính năng cao cấp
- 🎵 **Mini Player**: Thanh phát nhạc cố định với progress bar đảo ngược
- 🎤 **Now Playing**: Màn hình toàn màn hình với lyrics tự động highlight
- ❤️ **Like Songs**: Thêm/bỏ bài hát yêu thích
- 🔀 **Shuffle & Repeat**: Chế độ phát ngẫu nhiên và lặp lại

## 🚀 Cài đặt

### 1. Tạo project (Nếu chưa có)

\`\`\`bash
npx create-expo-app@latest music-streaming-app --template blank-typescript
cd music-streaming-app
\`\`\`

### 2. Cài đặt dependencies

\`\`\`bash
npm install nativewind
npm install --save-dev tailwindcss@3.3.2
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install expo-linear-gradient
npm install @react-native-community/slider
\`\`\`

### 3. Copy các file

Copy toàn bộ các file từ thư mục \`expo-music-app\` vào project của bạn:

- \`App.tsx\`
- \`global.css\`
- \`babel.config.js\`
- \`metro.config.js\`
- \`tailwind.config.js\`
- \`tsconfig.json\`
- Thư mục \`screens/\`
- Thư mục \`components/\`
- Thư mục \`context/\`
- Thư mục \`data/\`
- Thư mục \`types/\`

## 📱 Chạy ứng dụng

### Chạy trên Expo Go (Khuyến nghị cho lần đầu)

\`\`\`bash
npm start
\`\`\`

Sau đó:
1. Tải app **Expo Go** từ App Store (iOS) hoặc Google Play (Android)
2. Scan QR code hiển thị trên terminal
3. App sẽ tự động load trên điện thoại

### Chạy trên iOS Simulator (Cần Mac)

\`\`\`bash
npm run ios
\`\`\`

### Chạy trên Android Emulator

\`\`\`bash
npm run android
\`\`\`

## 🎨 Màu sắc chính

- **Gradient chính**: Blue (#1e3a8a) → Cyan (#0e7490) → Black (#000000)
- **Accent**: Cyan (#67e8f9)
- **Highlight**: Pink (#ec4899) cho icon yêu thích
- **Premium**: Gold (#fbbf24) cho crown icon

## 📂 Cấu trúc thư mục

\`\`\`
music-streaming-app/
├── screens/
│   ├── HomeScreen.tsx          # Màn hình chính
│   ├── SearchScreen.tsx        # Màn hình tìm kiếm
│   ├── LibraryScreen.tsx       # Thư viện nhạc
│   └── PremiumScreen.tsx       # Premium features
├── components/
│   ├── MiniPlayer.tsx          # Thanh phát nhạc mini
│   └── NowPlayingScreen.tsx    # Màn hình phát nhạc toàn màn hình
├── context/
│   └── MusicContext.tsx        # Context quản lý state toàn cục
├── data/
│   └── songs.ts                # Dữ liệu bài hát mẫu
├── types/
│   └── index.ts                # TypeScript types
├── App.tsx                     # File chính
├── global.css                  # Tailwind styles
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
├── tailwind.config.js          # Tailwind config
└── tsconfig.json               # TypeScript config
\`\`\`

## 🛠 Công nghệ sử dụng

- **React Native** với **Expo**
- **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **React Navigation** (Bottom Tabs)
- **Expo Linear Gradient**
- **React Context API** cho state management
- **Expo Vector Icons** (Ionicons)

## 📝 Ghi chú

- Ứng dụng sử dụng dữ liệu mẫu (mock data)
- Progress bar tự động tăng khi phát nhạc (simulation)
- Lyrics tự động scroll và highlight theo thời gian
- Hỗ trợ bài hát có và không có lyrics
- Responsive trên mọi kích thước màn hình mobile

## 🎯 Tính năng nâng cao có thể thêm

- [ ] Tích hợp API âm nhạc thực (Spotify, Apple Music)
- [ ] Phát nhạc thực với expo-av
- [ ] Lưu trữ dữ liệu local với AsyncStorage
- [ ] Tải nhạc offline
- [ ] Playlist tùy chỉnh
- [ ] Share bài hát
- [ ] Dark/Light mode toggle

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy chạy:

\`\`\`bash
# Clear cache
npm start -- --clear

# Hoặc
expo start -c
\`\`\`

---

**Chúc bạn code vui vẻ! 🎉**
\`\`\`
