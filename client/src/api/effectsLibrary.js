/**
 * Effects Library — Preset video effects using FFmpeg filters
 * All effects work client-side with FFmpeg WASM
 */

/**
 * Color & Style Filters
 * Each filter is an FFmpeg filter string
 */
export const COLOR_FILTERS = [
    {
        id: 'none',
        name: 'Original',
        icon: '🎬',
        description: 'No filter applied',
        filter: '',
    },
    {
        id: 'vintage',
        name: 'Vintage',
        icon: '🎞️',
        description: 'Warm retro look with faded colors',
        filter: 'eq=contrast=1.1:brightness=0.05:saturation=0.8,colorbalance=rs=0.1:gs=-0.05:bs=-0.1:rh=0.05:gh=-0.02',
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        icon: '🎥',
        description: 'Film-like color grading with teal & orange',
        filter: 'eq=contrast=1.15:brightness=-0.02,colorbalance=rs=0.08:gs=-0.05:bs=-0.1:rh=-0.05:gh=0.03:bh=0.08',
    },
    {
        id: 'warm',
        name: 'Warm',
        icon: '☀️',
        description: 'Golden warm tones',
        filter: 'colorbalance=rs=0.15:gs=0.05:bs=-0.1:rh=0.1:gh=0.05:bh=-0.05',
    },
    {
        id: 'cool',
        name: 'Cool',
        icon: '❄️',
        description: 'Blue-tinted cool tones',
        filter: 'colorbalance=rs=-0.1:gs=-0.02:bs=0.15:rh=-0.08:gh=0:bh=0.1',
    },
    {
        id: 'bw',
        name: 'Black & White',
        icon: '⚫',
        description: 'Classic monochrome',
        filter: 'hue=s=0',
    },
    {
        id: 'sepia',
        name: 'Sepia',
        icon: '📜',
        description: 'Old photo sepia tone',
        filter: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0',
    },
    {
        id: 'dramatic',
        name: 'Dramatic',
        icon: '🎭',
        description: 'High contrast dramatic look',
        filter: 'eq=contrast=1.4:brightness=-0.05:saturation=0.7,colorbalance=rs=-0.05:bs=0.1',
    },
    {
        id: 'vivid',
        name: 'Vivid',
        icon: '🌈',
        description: 'Punchy saturated colors',
        filter: 'eq=saturation=1.5:contrast=1.1:brightness=0.02',
    },
    {
        id: 'muted',
        name: 'Muted',
        icon: '🌫️',
        description: 'Desaturated muted tones',
        filter: 'eq=saturation=0.5:contrast=1.05:brightness=0.05',
    },
    {
        id: 'noir',
        name: 'Film Noir',
        icon: '🕵️',
        description: 'Dark high-contrast black & white',
        filter: 'hue=s=0,eq=contrast=1.5:brightness=-0.1',
    },
    {
        id: 'sunset',
        name: 'Sunset',
        icon: '🌅',
        description: 'Orange-pink sunset tones',
        filter: 'colorbalance=rs=0.2:gs=0.05:bs=-0.15:rh=0.15:gh=-0.05:bh=-0.1',
    },
];

/**
 * Zoom Effects
 * Applied using FFmpeg's zoompan filter
 */
export const ZOOM_EFFECTS = [
    {
        id: 'none',
        name: 'No Zoom',
        icon: '⬜',
        description: 'Static frame',
        filter: '',
    },
    {
        id: 'zoom-in-slow',
        name: 'Slow Zoom In',
        icon: '🔍',
        description: 'Gentle zoom towards center',
        getFilter: (duration) => `zoompan=z='min(zoom+0.001,1.3)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`,
    },
    {
        id: 'zoom-out-slow',
        name: 'Slow Zoom Out',
        icon: '🔎',
        description: 'Start zoomed, slowly pull back',
        getFilter: (duration) => `zoompan=z='if(eq(on,1),1.3,max(zoom-0.001,1))':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`,
    },
    {
        id: 'ken-burns-left',
        name: 'Ken Burns Left',
        icon: '➡️',
        description: 'Pan from left to right with zoom',
        getFilter: (duration) => `zoompan=z='min(zoom+0.0008,1.2)':d=${duration * 25}:x='if(eq(on,1),0,min(x+2,iw))':y='ih/2-(ih/zoom/2)':s=1080x1920`,
    },
    {
        id: 'ken-burns-right',
        name: 'Ken Burns Right',
        icon: '⬅️',
        description: 'Pan from right to left with zoom',
        getFilter: (duration) => `zoompan=z='min(zoom+0.0008,1.2)':d=${duration * 25}:x='if(eq(on,1),iw,max(x-2,0))':y='ih/2-(ih/zoom/2)':s=1080x1920`,
    },
    {
        id: 'zoom-pulse',
        name: 'Zoom Pulse',
        icon: '💓',
        description: 'Gentle zoom in and out',
        getFilter: (duration) => `zoompan=z='1+0.1*sin(on*0.05)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`,
    },
];

/**
 * Speed Effects
 * Applied using FFmpeg's setpts (video) and atempo (audio)
 */
export const SPEED_EFFECTS = [
    {
        id: 'none',
        name: 'Normal',
        icon: '▶️',
        description: 'Original speed',
        videoFilter: '',
        audioFilter: '',
    },
    {
        id: 'slow-0.5x',
        name: 'Slow 0.5x',
        icon: '🐢',
        description: 'Half speed — dreamy slow motion',
        videoFilter: 'setpts=2*PTS',
        audioFilter: 'atempo=0.5',
    },
    {
        id: 'slow-0.75x',
        name: 'Slow 0.75x',
        icon: '🐌',
        description: 'Slightly slower',
        videoFilter: 'setpts=1.33*PTS',
        audioFilter: 'atempo=0.75',
    },
    {
        id: 'fast-1.5x',
        name: 'Fast 1.5x',
        icon: '🏃',
        description: '1.5x speed — quick and snappy',
        videoFilter: 'setpts=0.67*PTS',
        audioFilter: 'atempo=1.5',
    },
    {
        id: 'fast-2x',
        name: 'Fast 2x',
        icon: '🚀',
        description: 'Double speed — fast forward',
        videoFilter: 'setpts=0.5*PTS',
        audioFilter: 'atempo=2.0',
    },
    {
        id: 'fast-3x',
        name: 'Fast 3x',
        icon: '⚡',
        description: 'Triple speed — hyperlapse',
        videoFilter: 'setpts=0.33*PTS',
        audioFilter: 'atempo=2.0,atempo=1.5',
    },
];

/**
 * Build a combined FFmpeg filter string from selected effects
 * @param {object} options - { color, zoom, speed, duration }
 * @returns {object} { videoFilter, audioFilter }
 */
export function buildEffectsFilter(options) {
    const { color = 'none', zoom = 'none', speed = 'none', duration = 30 } = options;

    const filters = [];
    let audioFilter = '';

    // 1. Color filter
    const colorEffect = COLOR_FILTERS.find(f => f.id === color);
    if (colorEffect && colorEffect.filter) {
        filters.push(colorEffect.filter);
    }

    // 2. Zoom effect
    const zoomEffect = ZOOM_EFFECTS.find(f => f.id === zoom);
    if (zoomEffect && zoomEffect.getFilter) {
        filters.push(zoomEffect.getFilter(duration));
    }

    // 3. Speed effect
    const speedEffect = SPEED_EFFECTS.find(f => f.id === speed);
    if (speedEffect) {
        if (speedEffect.videoFilter) filters.push(speedEffect.videoFilter);
        if (speedEffect.audioFilter) audioFilter = speedEffect.audioFilter;
    }

    return {
        videoFilter: filters.length > 0 ? filters.join(',') : '',
        audioFilter,
    };
}

/**
 * Get effect by ID from any category
 */
export function getEffect(category, id) {
    const categories = { color: COLOR_FILTERS, zoom: ZOOM_EFFECTS, speed: SPEED_EFFECTS };
    return categories[category]?.find(f => f.id === id) || null;
}
