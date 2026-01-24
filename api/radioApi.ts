import axios from 'axios';

// RadioBrowser API - Free public radio directory
const RADIO_API_BASE = 'https://de1.api.radio-browser.info/json';

export interface RadioStation {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    favicon: string;
    country: string;
    language: string;
    votes: number;
    codec: string;
    bitrate: number;
    tags: string;
}

/**
 * Get top radio stations by votes
 */
export const getTopRadioStations = async (limit: number = 20): Promise<RadioStation[]> => {
    try {
        const response = await axios.get(`${RADIO_API_BASE}/stations/topvote/${limit}`);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching top radio stations:', error);
        return [];
    }
};

/**
 * Get stations by tag/genre
 */
export const getStationsByTag = async (tag: string, limit: number = 20): Promise<RadioStation[]> => {
    try {
        const response = await axios.get(`${RADIO_API_BASE}/stations/bytag/${tag}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching stations by tag ${tag}:`, error);
        return [];
    }
};

/**
 * Search stations by name
 */
export const searchStations = async (query: string, limit: number = 20): Promise<RadioStation[]> => {
    try {
        const response = await axios.get(`${RADIO_API_BASE}/stations/search`, {
            params: {
                name: query,
                limit,
                hidebroken: true, // Hide broken streams
                order: 'votes', // Order by popularity
                reverse: true
            }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Error searching stations:`, error);
        return [];
    }
};

/**
 * Get popular genres/tags
 */
export const getPopularTags = async (limit: number = 20): Promise<string[]> => {
    try {
        const response = await axios.get(`${RADIO_API_BASE}/tags`, {
            params: { limit }
        });
        return response.data.map((tag: any) => tag.name);
    } catch (error) {
        console.error('❌ Error fetching tags:', error);
        return [];
    }
};

/**
 * Click/vote for a station (tracks listening)
 */
export const clickStation = async (stationUuid: string): Promise<void> => {
    try {
        await axios.get(`${RADIO_API_BASE}/url/${stationUuid}`);
    } catch (error) {
        console.error('❌ Error clicking station:', error);
    }
};
