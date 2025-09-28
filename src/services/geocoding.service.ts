import axios from 'axios';
import ApiError from '../utils/apiError';

interface Coords {
    latitude: number | null;
    longitude: number | null;
}

class GeocodingService {
    public async getFromAddress(address: string): Promise<Coords> {
        try {
            const apiKey = process.env.OPENCAGE_API_KEY;
            if (!apiKey) {
                console.error("OPENCAGE_API_KEY is not set in environment variables.");
                throw new ApiError(500, "Geocoding service is not configured.");
            }

            const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: address,
                    key: apiKey,
                    limit: 1,
                },
            });

            if (response.data && response.data.results.length > 0) {
                const coords = response.data.results[0].geometry;
                return { latitude: coords.lat, longitude: coords.lng };
            }
            
            return { latitude: null, longitude: null };
        } catch (error) {
            console.error("Error fetching geocoding data:", error);
            throw new ApiError(500, 'Gagal mengambil data geolokasi.');
        }
    }
}

export default new GeocodingService();