/**
 * ================================
 * CONTEXT-AWARE MUSIC AI ASSISTANT
 * ================================
 * AI that understands your music app's data
 */

const GEMINI_API_KEY = 'AIzaSyB9iv0mOQl_OAfko3GuZrVF_sTsNydNrKY';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Store app context for AI
let appContext = {
    currentSong: null as any,
    songs: [] as any[],
    likedSongs: [] as string[],
    playlists: [] as any[],
};

/**
 * Update app context for AI - Call this from ChatModal
 */
export function updateAIContext(context: {
    currentSong: any;
    songs: any[];
    likedSongs: string[];
    playlists: any[];
}) {
    appContext = context;
}

/**
 * Generate app-aware system context
 */
function generateSystemContext(): string {
    const { currentSong, songs, likedSongs, playlists } = appContext;

    let context = `You are an expert music assistant integrated into a music streaming app. You have access to the user's music data and can provide personalized recommendations.

**Current App State:**
`;

    if (currentSong) {
        context += `- Currently playing: "${currentSong.title}" by ${currentSong.artist}\n`;
    } else {
        context += `- No song currently playing\n`;
    }

    context += `- Total songs in library: ${songs.length}\n`;
    context += `- Liked songs: ${likedSongs.length}\n`;
    context += `- User playlists: ${playlists.length}\n`;

    if (songs.length > 0) {
        const sampleSongs = songs.slice(0, 10).map(s => `"${s.title}" by ${s.artist}`).join(', ');
        context += `- Some songs in library: ${sampleSongs}\n`;
    }

    if (likedSongs.length > 0) {
        const likedSongDetails = songs
            .filter(s => likedSongs.includes(s.id))
            .slice(0, 5)
            .map(s => `"${s.title}" by ${s.artist}`)
            .join(', ');
        if (likedSongDetails) {
            context += `- Some liked songs: ${likedSongDetails}\n`;
        }
    }

    if (playlists.length > 0) {
        const playlistNames = playlists.map(p => p.name).join(', ');
        context += `- Playlists: ${playlistNames}\n`;
    }

    context += `
**Your Capabilities:**
- Recommend songs from the user's library based on their preferences
- Suggest songs similar to what they like or are currently playing
- Help discover songs they haven't listened to yet
- Provide information about artists and genres in their library
- Answer music-related questions with specific references to their collection
- Suggest playlist ideas based on their music taste

**Response Style:**
- Be conversational and enthusiastic about music 🎵
- Reference specific songs from their library when making recommendations
- Keep responses concise (2-4 sentences) unless asked for more detail
- Use emojis to make conversations engaging
- When suggesting songs, mention both the title AND artist

Remember: You have access to the user's actual music library, so make recommendations from songs they already have!`;

    return context;
}

// Store conversation history
let conversationHistory: any[] = [];

/**
 * Send a message to the AI and get a response
 */
export async function sendMessageToAI(message: string): Promise<string> {
    try {
        const isFirstMessage = conversationHistory.length === 0;
        const shouldRefreshContext = isFirstMessage || conversationHistory.length % 10 === 0;

        if (shouldRefreshContext) {
            const systemContext = generateSystemContext();

            if (conversationHistory.length > 0) {
                conversationHistory = [];
            }

            conversationHistory.push({
                role: 'user',
                parts: [{ text: systemContext }]
            });
            conversationHistory.push({
                role: 'model',
                parts: [{ text: 'Hello! I\'m your personal music assistant! 🎵 I can see your music library and help you discover songs. What would you like to know?' }]
            });
        }

        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const requestBody = {
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        conversationHistory.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return aiResponse;
    } catch (error) {
        console.error('❌ Error with AI:', error);

        if (error instanceof Error) {
            if (error.message.includes('403') || error.message.includes('API key')) {
                return '🔑 API key issue! Get a new free key at: https://makersuite.google.com/app/apikey';
            }
            if (error.message.includes('404')) {
                return '🎵 AI model unavailable. Please try again later!';
            }
            if (error.message.includes('429')) {
                // Quota exceeded - provide smart fallback
                return generateSmartFallback(message);
            }
        }

        return '🎵 Connection issue! Please check your internet and try again.';
    }
}

/**
 * Generate smart fallback response when quota exceeded
 */
function generateSmartFallback(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    const { currentSong, songs, likedSongs } = appContext;

    // Check what user is asking about
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('gợi ý')) {
        if (likedSongs.length > 0) {
            const liked = songs.filter(s => likedSongs.includes(s.id));
            if (liked.length > 0) {
                const recommendation = liked[Math.floor(Math.random() * liked.length)];
                return `⚠️ AI quota exceeded! But based on your liked songs, try "${recommendation.title}" by ${recommendation.artist}! 🎵\n\n💡 Tip: Wait 30s or get a new API key at ai.google.dev`;
            }
        }
        if (songs.length > 0) {
            const random = songs[Math.floor(Math.random() * songs.length)];
            return `⚠️ AI quota exceeded! But I found "${random.title}" by ${random.artist} in your library! 🎵\n\n💡 Get new API key at ai.google.dev`;
        }
    }

    if (lowerMessage.includes('current') || lowerMessage.includes('playing') || lowerMessage.includes('đang phát')) {
        if (currentSong) {
            return `🎵 Currently playing: "${currentSong.title}" by ${currentSong.artist}!\n\n⚠️ AI quota exceeded. Wait 30s or get new API key.`;
        } else {
            return `No song playing right now. Start listening! 🎵\n\n⚠️ AI quota exceeded.`;
        }
    }

    if (lowerMessage.includes('liked') || lowerMessage.includes('favorite') || lowerMessage.includes('yêu thích')) {
        return `❤️ You have ${likedSongs.length} liked songs! ${likedSongs.length > 0 ? 'Great taste!' : 'Start adding favorites!'}\n\n⚠️ AI quota exceeded (20 req/min limit).`;
    }

    if (lowerMessage.includes('library') || lowerMessage.includes('collection') || lowerMessage.includes('thư viện')) {
        return `📚 Your library: ${songs.length} songs! Amazing collection! 🎵\n\n⚠️ AI quota exceeded. Get new key at ai.google.dev`;
    }

    // Generic fallback
    return `⚠️ **AI Quota Exceeded** (20 requests/minute limit)\n\n📊 **Your Stats:**\n🎵 Library: ${songs.length} songs\n❤️ Liked: ${likedSongs.length} songs\n${currentSong ? `🎧 Playing: "${currentSong.title}"` : '� No song playing'}\n\n💡 **Solutions:**\n• Wait 30 seconds\n• Get free API key: ai.google.dev/gemini-api/docs/api-key`;
}

/**
 * Reset the chat session
 */
export function resetChatSession() {
    conversationHistory = [];
}

/**
 * Get suggested prompts for users
 */
export function getMusicPrompts(): string[] {
    return [
        '🎵 Recommend songs from my library',
        '❤️ What should I listen to based on my liked songs?',
        '🎸 Tell me about the current song',
        '🎧 Suggest songs similar to what\'s playing',
        '💡 Create a playlist idea from my music',
        '🔥 What genres do I have in my library?',
    ];
}
