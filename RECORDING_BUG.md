# Recording Feature - Known Issues

## ⚠️ DISABLED DUE TO BUG

The video recording feature for livestreams is currently **disabled** due to a critical bug in `expo-camera`.

### Issue Description

**Bug**: Camera consistently reports "Camera is not ready yet. Wait for 'onCameraReady' callback" even after:
- ✅ `onCameraReady` callback has fired
- ✅ Camera is visibly working and streaming
- ✅ Multiple seconds have passed (tried 1s, 2s, 3s delays)
- ✅ Manual user-initiated recording (not automatic)
- ✅ Multiple retry attempts with exponential backoff

### Attempted Solutions

1. **Auto-start with delays**: Tried 500ms, 1.5s, 2s, 3s delays after `onCameraReady`
2. **Manual recording**: User manually triggers recording after broadcast starts
3. **Retry logic**: Implemented automatic retry with exponential backoff (3 attempts)
4. **Simplified options**: Removed all recordAsync() parameters
5. **Callback verification**: Added extensive logging to confirm callback fires
6. **State tracking**: Verified cameraReady state is true before attempting

**Result**: All attempts failed with the same error.

### Code Status

All recording code is **preserved but commented out**:
- ✅ `CameraBroadcast.tsx`: Record button commented, functions intact
- ✅ `liveApi.ts`: Recording API functions preserved
- ✅ `LivestreamHistory.tsx`: Component file kept for future use
- ✅ `LiveScreen.tsx`: History tab commented out

### Potential Fixes

1. **Wait for expo-camera update**: Bug may be fixed in future versions
2. **Use different library**: Consider `react-native-vision-camera` (requires native rebuild)
3. **Platform-specific workaround**: May work on one platform but not the other

### How to Re-enable

When bug is fixed:

1. Uncomment record button in `CameraBroadcast.tsx` (line ~323-341)
2. Uncomment history tab in `LiveScreen.tsx` (line ~159-172)
3. Uncomment history tab content in `LiveScreen.tsx` (line ~234-236)
4. Test thoroughly on both iOS and Android
5. Remove this document

### References

- Expo Camera Docs: https://docs.expo.dev/versions/latest/sdk/camera/
- Similar issues: https://github.com/expo/expo/issues
- expo-camera version: ~17.0.10 (SDK 54)

---

**Last Updated**: 2026-01-29  
**Status**: Disabled, pending expo-camera fix
