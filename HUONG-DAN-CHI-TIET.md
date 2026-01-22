# 📖 HƯỚNG DẪN CHI TIẾT - MUSIC STREAMING APP

## 🎯 Bước 1: Chuẩn bị môi trường

### Cài đặt Node.js

Tải và cài đặt Node.js từ: https://nodejs.org/ (phiên bản LTS)

Kiểm tra cài đặt:
\`\`\`bash
node --version
npm --version
\`\`\`

### Cài đặt Expo CLI (tùy chọn)

\`\`\`bash
npm install -g expo-cli
\`\`\`

---

## 🚀 Bước 2: Tạo project mới

Mở Terminal/Command Prompt và chạy:

\`\`\`bash

# Tạo project với TypeScript template

npx create-expo-app@latest music-streaming-app --template blank-typescript

# Di chuyển vào thư mục project

cd music-streaming-app
\`\`\`

---

## 📦 Bước 3: Cài đặt dependencies

Chạy từng lệnh sau:

\`\`\`bash

# 1. NativeWind (Tailwind CSS cho React Native)

npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# 2. React Navigation

npm install @react-navigation/native
npm install @react-navigation/bottom-tabs

# 3. React Navigation dependencies

npm install react-native-screens react-native-safe-area-context

# 4. Expo Linear Gradient

npm install expo-linear-gradient

# 5. Slider component

npm install @react-native-community/slider
\`\`\`

Hoặc cài tất cả cùng lúc:

\`\`\`bash
npm install nativewind @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-linear-gradient @react-native-community/slider && npm install --save-dev tailwindcss@3.3.2
\`\`\`

---

## 📝 Bước 4: Tạo cấu trúc thư mục

Trong thư mục \`music-streaming-app\`, tạo các thư mục sau:

\`\`\`
music-streaming-app/
├── components/
├── context/
├── data/
├── screens/
└── types/
\`\`\`

Trên Windows:
\`\`\`bash
mkdir components context data screens types
\`\`\`

Trên Mac/Linux:
\`\`\`bash
mkdir components context data screens types
\`\`\`

---

## 🔧 Bước 5: Tạo các file cấu hình

### 1. File: \`tailwind.config.js\`

Tạo file mới trong thư mục root, copy nội dung từ file mẫu.

### 2. File: \`babel.config.js\`

Thay thế nội dung file có sẵn bằng nội dung từ file mẫu.

### 3. File: \`metro.config.js\`

Tạo file mới, copy nội dung từ file mẫu.

### 4. File: \`global.css\`

Tạo file mới, copy nội dung từ file mẫu.

### 5. File: \`tsconfig.json\`

Cập nhật file có sẵn, thêm \`"types": ["nativewind/types"]\` vào \`compilerOptions\`.

---

## 📁 Bước 6: Tạo các file code

### Types (types/index.ts)

Copy toàn bộ nội dung từ file mẫu vào \`types/index.ts\`

### Data (data/songs.ts)

Copy toàn bộ nội dung từ file mẫu vào \`data/songs.ts\`

### Context (context/MusicContext.tsx)

Copy toàn bộ nội dung từ file mẫu vào \`context/MusicContext.tsx\`

### Screens

Copy các file sau vào thư mục \`screens/\`:

- \`HomeScreen.tsx\`
- \`SearchScreen.tsx\`
- \`LibraryScreen.tsx\`
- \`PremiumScreen.tsx\`

### Components

Copy các file sau vào thư mục \`components/\`:

- \`MiniPlayer.tsx\`
- \`NowPlayingScreen.tsx\`

### App.tsx

Thay thế file \`App.tsx\` gốc bằng file mẫu.

---

## ▶️ Bước 7: Chạy ứng dụng

### Cách 1: Chạy với Expo Go (Khuyến nghị)

1. Cài đặt **Expo Go** trên điện thoại:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Chạy lệnh:
   \`\`\`bash
   npm start
   \`\`\`

3. Scan QR code:
   - **iOS**: Mở Camera và scan QR code
   - **Android**: Mở app Expo Go, nhấn "Scan QR code"

### Cách 2: Chạy trên iOS Simulator (Chỉ Mac)

\`\`\`bash
npm run ios
\`\`\`

### Cách 3: Chạy trên Android Emulator

1. Cài đặt Android Studio
2. Tạo Android Virtual Device (AVD)
3. Chạy:
   \`\`\`bash
   npm run android
   \`\`\`

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Unable to resolve module"

\`\`\`bash

# Clear cache và reinstall

rm -rf node_modules
npm install
npm start -- --clear
\`\`\`

### Lỗi: "Metro bundler error"

\`\`\`bash

# Restart với clear cache

expo start -c
\`\`\`

### Lỗi: "NativeWind không hoạt động"

1. Kiểm tra \`babel.config.js\` đã thêm \`"nativewind/babel"\`
2. Kiểm tra \`tailwind.config.js\` có đúng content paths
3. Khởi động lại:
   \`\`\`bash
   npm start -- --clear
   \`\`\`

### Lỗi: "Navigation không hoạt động"

Đảm bảo đã cài đủ dependencies:
\`\`\`bash
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
\`\`\`

---

## 🎨 Tùy chỉnh ứng dụng

### Thay đổi màu sắc

Mở \`screens/HomeScreen.tsx\` và các file khác, tìm \`LinearGradient\`:
\`\`\`typescript
colors={['#1e3a8a', '#0e7490', '#000000']}
// Thay đổi thành màu bạn muốn
\`\`\`

### Thêm bài hát mới

Mở \`data/songs.ts\` và thêm object mới vào mảng \`songsData\`:
\`\`\`typescript
{
id: 7,
title: "Tên bài hát",
artist: "Nghệ sĩ",
album: "Album",
duration: "3:30",
cover: "URL ảnh",
size: "8.0 MB",
quality: "320 kbps",
lyrics: [...] // Optional
}
\`\`\`

### Thay đổi icon

Tìm kiếm icon tại: https://icons.expo.fyi/Index
Thay thế tên icon trong các file component.

---

## 📱 Build ứng dụng production

### Build APK (Android)

\`\`\`bash

# Cài đặt EAS CLI

npm install -g eas-cli

# Login vào Expo

eas login

# Build

eas build --platform android
\`\`\`

### Build IPA (iOS) - Cần Apple Developer Account

\`\`\`bash
eas build --platform ios
\`\`\`

---

## 💡 Tips

1. **Sử dụng Expo Go để test nhanh** - Không cần build mỗi lần thay đổi
2. **Hot Reload** - Nhấn \`r\` trong terminal để reload app
3. **Debug Menu** - Lắc điện thoại hoặc nhấn \`Cmd+D\` (iOS) / \`Cmd+M\` (Android)
4. **Console logs** - Xem logs trực tiếp trong terminal

---

## 📚 Tài liệu tham khảo

- Expo Docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- NativeWind: https://www.nativewind.dev/
- React Native: https://reactnative.dev/

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề, hãy kiểm tra lại từng bước hoặc xem phần "Xử lý lỗi thường gặp".