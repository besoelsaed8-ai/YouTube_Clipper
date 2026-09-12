/**
 * Netlify Function: /api/download
 * Downloads YouTube videos using Cobalt API (free, no yt-dlp needed)
 */

const COBALT_INSTANCES = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekmiki.com',
    'https://api.duck.cobalt.tools',
    'https://cobalt.canine.tools',
    'https://co.eepy.today',
];

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
        const { url, quality } = JSON.parse(event.body);
        if (!url) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL is required' }) };
        }

        // Extract video ID
        const videoId = extractVideoId(url);
        if (!videoId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid YouTube URL' }) };
        }

        // Try Cobalt API instances
        for (const instance of COBALT_INSTANCES) {
            try {
                console.log(`Trying Cobalt instance: ${instance}`);

                const response = await fetch(instance, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        videoQuality: quality || '1080',
                        filenameStyle: 'pretty',
                    }),
                });

                const data = await response.json();

                if (data.url) {
                    console.log(`Success with ${instance}`);

                    // Download the video
                    const videoResponse = await fetch(data.url);
                    const videoBuffer = await videoResponse.arrayBuffer();

                    return {
                        statusCode: 200,
                        headers: {
                            ...headers,
                            'Content-Type': 'video/mp4',
                            'Content-Disposition': `attachment; filename="${data.filename || 'video.mp4'}"`,
                        },
                        body: Buffer.from(videoBuffer).toString('base64'),
                        isBase64Encoded: true,
                    };
                }
            } catch (e) {
                console.log(`Failed with ${instance}: ${e.message}`);
                continue;
            }
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'All download services failed. Please try again later.' }),
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
