const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * POST /api/cobalt-proxy
 * Server calls Cobalt API → gets CDN download URL → returns it to browser.
 * Browser downloads from CDN (not YouTube), so YouTube doesn't block it.
 */
router.post('/', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const COBALT_INSTANCES = [
        'https://api.cobalt.tools',
        'https://cobalt-api.kwiatekmiki.com',
        'https://co.eepy.today',
        'https://cobalt.canine.tools',
    ];

    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[CobaltProxy] Trying ${instance}...`);
            const resp = await axios.post(instance, {
                url: url,
                videoQuality: '1080',
                filenameStyle: 'pretty',
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });

            if (resp.data?.url) {
                console.log(`[CobaltProxy] ✅ Got download URL from ${instance}`);
                return res.json({
                    downloadUrl: resp.data.url,
                    filename: resp.data.filename || 'video.mp4',
                });
            }
        } catch (e) {
            console.log(`[CobaltProxy] ❌ ${instance}: ${e.message}`);
            continue;
        }
    }

    res.status(500).json({ error: 'All Cobalt instances failed' });
});

module.exports = router;
