/**
 * Netlify Function: /api/info
 * Returns YouTube video info using oEmbed (official API, never blocked)
 */

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { url } = JSON.parse(event.body);
        if (!url) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL is required' }) };
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid YouTube URL' }) };
        }

        // Try oEmbed (official YouTube API, never blocked)
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oembedUrl);

            if (response.ok) {
                const data = await response.json();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        title: data.title || 'YouTube Video',
                        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                        duration: 0,
                        id: videoId,
                        author: data.author_name,
                        source: 'oembed',
                    }),
                };
            }
        } catch (e) {
            console.log('oEmbed failed:', e.message);
        }

        // Fallback
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                title: 'YouTube Video',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 0,
                id: videoId,
                source: 'thumbnail-only',
            }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}
