/**
 * Landing page SEO data.
 * Each entry is keyed by its route path.
 * Content is unique per page — no duplicate copy.
 */

const landingPages = {
  '/youtube-video-cutter': {
    title: 'Free YouTube Video Cutter Online',
    description:
      'Cut any YouTube video online for free. Trim start and end times, extract the exact segment you need, and download it instantly — no software required.',
    canonicalPath: '/youtube-video-cutter',
    keywords:
      'youtube video cutter, cut youtube video online, youtube trimmer, trim youtube video, youtube video trimmer online, cut video online free, youtube clip tool',
    h1: 'Free YouTube Video Cutter Online',
    intro:
      'Need to extract a specific part of a YouTube video? Our online YouTube video cutter lets you trim any video by choosing start and end times — directly in your browser. No downloads, no sign-ups, completely free.',
    features: [
      {
        title: 'Precise Trimming',
        desc: 'Choose exact start and end timestamps to extract the exact segment you need from any YouTube video.',
      },
      {
        title: 'No Software Needed',
        desc: 'Works entirely in your web browser. No desktop apps, no browser extensions, no installation required.',
      },
      {
        title: 'Instant Download',
        desc: 'After cutting, your clip is ready to download immediately as an MP4 file. Fast and straightforward.',
      },
      {
        title: 'Mobile Friendly',
        desc: 'Use the YouTube video cutter on your phone, tablet, or desktop — the interface adapts to any screen size.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste the YouTube URL', desc: 'Copy any YouTube video link and paste it into the input field above.' },
      { step: 2, title: 'Choose Clip Duration', desc: 'Select how long each clip should be — 30, 45, or 60 seconds.' },
      { step: 3, title: 'Download Your Clip', desc: 'The tool processes the video and gives you ready-to-use MP4 clips.' },
    ],
    useCases: [
      'Extract highlights from long tutorials',
      'Cut out the best moments from interviews',
      'Trim music videos to your favorite parts',
      'Create short clips for social media sharing',
    ],
    faq: [
      {
        q: 'Can I cut a specific part of a YouTube video?',
        a: 'Yes. Paste the YouTube link, and the tool splits the video into clips of your chosen duration. You can then select and download the exact clip you want.',
      },
      {
        q: 'Is the YouTube video cutter free to use?',
        a: 'Absolutely. There are no hidden fees, no premium tiers, and no watermarks added to your clips.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No. The tool runs entirely in your web browser — nothing to download or install.',
      },
      {
        q: 'What formats are supported?',
        a: 'The cutter works with all YouTube video formats and outputs MP4, which is compatible with every major platform.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Turn long videos into vertical Shorts automatically.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos into clips.' },
      { name: 'Video Cutter', path: '/video-cutter', desc: 'Cut any video file directly in your browser.' },
    ],
  },

  '/youtube-clipper': {
    title: 'YouTube Clipper — Download & Split Videos into Clips',
    description:
      'Download any YouTube video and split it into short clips automatically. Free, open-source YouTube clipper works in your browser — no signup required.',
    canonicalPath: '/youtube-clipper',
    keywords:
      'youtube clipper, youtube clip tool, clip youtube video, youtube video clipper online, free youtube clipper, clip youtube video online, youtube video splitter',
    h1: 'YouTube Clipper — Download & Split Videos into Clips',
    intro:
      'YouTube Clipper is a free, open-source tool that downloads any YouTube video and automatically splits it into short clips. Whether you need 30-second highlights or 60-second segments, this tool handles it all in your browser.',
    features: [
      {
        title: 'Download Any YouTube Video',
        desc: 'Paste any YouTube link — regular videos, Shorts, live streams — and download it in high quality up to 1080p.',
      },
      {
        title: 'Auto-Split into Clips',
        desc: 'Automatically divide long videos into 30s, 45s, or 60s segments, perfect for social media.',
      },
      {
        title: 'Vertical Crop (9:16)',
        desc: 'One-click crop to vertical format optimized for TikTok, Reels, and YouTube Shorts.',
      },
      {
        title: 'Browser-Based Processing',
        desc: 'All video processing happens in your browser using FFmpeg WASM — no server load, complete privacy.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste Your YouTube Link', desc: 'Copy any YouTube video URL and paste it into the clipper. The tool fetches video details automatically.' },
      { step: 2, title: 'Configure Your Clips', desc: 'Choose clip duration and enable vertical crop for 9:16 Shorts format.' },
      { step: 3, title: 'Download Clips', desc: 'Preview all generated clips, select the ones you like, and download them individually or in bulk.' },
    ],
    useCases: [
      'Content creators repurposing long-form videos',
      'Social media managers creating TikTok and Reels content',
      'Podcasters extracting highlight clips',
      'YouTubers creating Shorts from existing videos',
    ],
    faq: [
      {
        q: 'What is YouTube Clipper?',
        a: 'YouTube Clipper is a free, open-source web tool that downloads YouTube videos and splits them into short clips — ideal for TikTok, Instagram Reels, and YouTube Shorts.',
      },
      {
        q: 'Is YouTube Clipper really free?',
        a: 'Yes. It is 100% free and open source. No hidden fees, no premium plans, no watermarks.',
      },
      {
        q: 'How many clips can I create?',
        a: 'There is no limit. A 10-minute video with 30-second clips produces about 20 clips. Longer videos produce more.',
      },
      {
        q: 'Can I self-host YouTube Clipper?',
        a: 'Yes. The project is open source and can be deployed on your own server using Docker.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create vertical Shorts from any video.' },
      { name: 'YouTube Video Cutter', path: '/youtube-video-cutter', desc: 'Trim specific parts of YouTube videos.' },
      { name: 'YouTube to TikTok', path: '/youtube-to-tiktok', desc: 'Convert YouTube videos to TikTok format.' },
    ],
  },

  '/youtube-shorts-maker': {
    title: 'Free YouTube Shorts Maker — Create Shorts from Any Video',
    description:
      'Turn any YouTube video into YouTube Shorts automatically. Free online tool crops to 9:16 vertical format, splits into 60s clips, and downloads instantly.',
    canonicalPath: '/youtube-shorts-maker',
    keywords:
      'youtube shorts maker, create youtube shorts, youtube shorts creator, make youtube shorts from video, youtube shorts generator, shorts maker online, convert video to shorts',
    h1: 'Free YouTube Shorts Maker',
    intro:
      'Creating YouTube Shorts from long-form videos has never been easier. Our Shorts maker automatically downloads any YouTube video, crops it to the perfect 9:16 vertical format, and splits it into 60-second clips ready to upload as Shorts.',
    features: [
      {
        title: 'Automatic 9:16 Crop',
        desc: 'Intelligent center-cropping converts any landscape video to the vertical format YouTube Shorts requires.',
      },
      {
        title: '60-Second Clips',
        desc: 'YouTube Shorts must be 60 seconds or less. The tool splits your video into perfectly sized segments.',
      },
      {
        title: 'High Quality Output',
        desc: 'Clips are encoded in H.264 MP4 format — the exact format YouTube recommends for Shorts.',
      },
      {
        title: 'Batch Processing',
        desc: 'A 30-minute video generates about 30 Shorts clips in one go. Select and download the best ones.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste Your YouTube Link', desc: 'Enter any YouTube video URL into the tool. It fetches the video details and thumbnail.' },
      { step: 2, title: 'Enable Shorts Mode', desc: 'Toggle "Vertical Shorts Mode" to auto-crop to 9:16 format at 60-second intervals.' },
      { step: 3, title: 'Download Your Shorts', desc: 'Preview all generated Shorts, pick the best ones, and download them ready to upload.' },
    ],
    useCases: [
      'Repurposing long YouTube videos into Shorts',
      'Creating viral Shorts from podcast highlights',
      'Generating Shorts from gaming footage',
      'Extracting key moments from educational videos',
    ],
    faq: [
      {
        q: 'How do I create YouTube Shorts from a long video?',
        a: 'Paste your YouTube link, enable "Vertical Shorts Mode," and the tool automatically crops and splits the video into 60-second vertical clips.',
      },
      {
        q: 'What are the YouTube Shorts dimensions?',
        a: 'YouTube Shorts use a 9:16 vertical aspect ratio (1080x1920 pixels). Our tool automatically crops to this format.',
      },
      {
        q: 'How long should a YouTube Short be?',
        a: 'YouTube Shorts can be up to 60 seconds. Our tool creates clips of 30, 45, or 60 seconds — you choose.',
      },
      {
        q: 'Can I make Shorts from any YouTube video?',
        a: 'Yes. Any publicly available YouTube video can be converted into Shorts using this tool.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split any YouTube video.' },
      { name: 'YouTube to Shorts', path: '/youtube-to-shorts', desc: 'Convert long videos into Shorts format.' },
      { name: 'Podcast to Shorts', path: '/podcast-to-shorts', desc: 'Extract highlight clips from podcasts.' },
    ],
  },

  '/youtube-to-shorts': {
    title: 'YouTube to Shorts Converter — Turn Long Videos into Shorts',
    description:
      'Convert any YouTube video to YouTube Shorts format. Auto-crop to 9:16, split into 60s clips, download free — no software or sign-up needed.',
    canonicalPath: '/youtube-to-shorts',
    keywords:
      'youtube to shorts, convert youtube to shorts, youtube shorts converter, turn youtube video into shorts, youtube video to shorts, long video to shorts',
    h1: 'YouTube to Shorts Converter',
    intro:
      'Transform any long-form YouTube video into YouTube Shorts with a single click. This converter handles the entire workflow: downloading the video, cropping to vertical 9:16, and splitting into Shorts-ready clips.',
    features: [
      {
        title: 'One-Click Conversion',
        desc: 'Paste a URL, click once, and get YouTube Shorts — the entire process is automated.',
      },
      {
        title: 'Vertical 9:16 Format',
        desc: 'Automatic center-crop ensures your clips match YouTube\'s Shorts vertical video specification.',
      },
      {
        title: 'Flexible Clip Length',
        desc: 'Choose 30, 45, or 60-second clips depending on how you want to structure your Shorts.',
      },
      {
        title: 'No Quality Loss',
        desc: 'Output clips maintain the original video quality up to 1080p in standard MP4 format.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste the YouTube Link', desc: 'Enter any YouTube video URL. The tool validates the link and fetches video information.' },
      { step: 2, title: 'Select Shorts Settings', desc: 'Enable vertical crop and choose your preferred clip duration for the Shorts format.' },
      { step: 3, title: 'Download and Upload', desc: 'Download the generated Shorts clips and upload them directly to YouTube Shorts.' },
    ],
    useCases: [
      'Turning podcast episodes into discoverable Shorts',
      'Creating Shorts from educational tutorials',
      'Repurposing old YouTube content for Shorts',
      'Extracting viral-worthy moments from any video',
    ],
    faq: [
      {
        q: 'What is the difference between YouTube videos and Shorts?',
        a: 'Shorts are vertical (9:16), 60 seconds or less, and appear in YouTube\'s dedicated Shorts feed. Our converter handles both the format and duration requirements.',
      },
      {
        q: 'Can I convert a 1-hour video into Shorts?',
        a: 'Yes. The tool splits any length video into multiple Shorts clips. A 1-hour video produces about 60 one-minute Shorts.',
      },
      {
        q: 'Will the Shorts have a watermark?',
        a: 'No. The output clips are clean MP4 files with no watermarks, logos, or overlays.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts from any YouTube video.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
      { name: 'YouTube to TikTok', path: '/youtube-to-tiktok', desc: 'Convert videos for TikTok format.' },
    ],
  },

  '/video-cutter': {
    title: 'Free Online Video Cutter — Cut Any Video in Your Browser',
    description:
      'Cut and trim any video file directly in your browser. Free online video cutter supports MP4, MOV, AVI, and more — no upload to a server needed.',
    canonicalPath: '/video-cutter',
    keywords:
      'online video cutter, cut video online, free video cutter, trim video online, video trimmer online, cut mp4 online, video editor online free',
    h1: 'Free Online Video Cutter',
    intro:
      'Cut any video file directly in your browser without uploading it to a server. Our online video cutter uses WebAssembly technology to process videos locally — keeping your files private and secure while delivering fast results.',
    features: [
      {
        title: 'Process Locally',
        desc: 'Videos never leave your device. All cutting and trimming happens in your browser using FFmpeg WASM.',
      },
      {
        title: 'Multiple Formats',
        desc: 'Supports MP4, MOV, AVI, MKV, WebM, and other common video formats used across platforms.',
      },
      {
        title: 'No File Size Limit',
        desc: 'Cut videos of any size — from short clips to hour-long recordings. Processing scales with your device.',
      },
      {
        title: 'Instant Results',
        desc: 'Get your trimmed video in seconds. No waiting for uploads or server processing queues.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Upload Your Video', desc: 'Drag and drop your video file or click to select it from your device.' },
      { step: 2, title: 'Set Start and End Points', desc: 'Use the timeline to select the exact portion of the video you want to keep.' },
      { step: 3, title: 'Download the Cut Video', desc: 'Click download to save your trimmed video as an MP4 file.' },
    ],
    useCases: [
      'Trimming screen recordings before sharing',
      'Removing unwanted parts from personal videos',
      'Cutting video clips for presentations',
      'Preparing short clips for social media posts',
    ],
    faq: [
      {
        q: 'Is my video uploaded to a server?',
        a: 'No. Your video stays on your device. All processing happens locally in your browser using WebAssembly.',
      },
      {
        q: 'What video formats can I cut?',
        a: 'The video cutter supports MP4, MOV, AVI, MKV, WebM, and most other standard video formats.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'There is no artificial limit. The actual limit depends on your device\'s available memory. Most modern devices handle videos up to several GB.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Video Cutter', path: '/youtube-video-cutter', desc: 'Cut specific parts from YouTube videos.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts from YouTube videos.' },
    ],
  },

  '/online-video-cutter': {
    title: 'Online Video Cutter — Cut Videos Without Downloading Software',
    description:
      'Use our free online video cutter to trim, cut, and split video files. Works in your browser with no software installation. Supports MP4, MOV, and more.',
    canonicalPath: '/online-video-cutter',
    keywords:
      'online video cutter, video cutter online free, cut video in browser, web video editor, trim video online free, no download video editor',
    h1: 'Online Video Cutter — No Download Required',
    intro:
      'Cut and edit videos without downloading any software. Our online video cutter runs entirely in your web browser, processing your videos locally for maximum privacy and speed.',
    features: [
      {
        title: 'Zero Installation',
        desc: 'Open the tool in any modern browser and start cutting videos immediately — nothing to install.',
      },
      {
        title: 'Private by Design',
        desc: 'Videos are processed locally in your browser. They never touch a server, ensuring complete privacy.',
      },
      {
        title: 'Works Everywhere',
        desc: 'Use on Windows, Mac, Linux, ChromeOS, or any device with a modern web browser.',
      },
      {
        title: 'Fast Processing',
        desc: 'No upload/download delays. Cutting starts instantly and finishes in seconds for most videos.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Open the Cutter', desc: 'Navigate to the online video cutter in your browser. No account needed.' },
      { step: 2, title: 'Select Your Video', desc: 'Upload a video file from your device or paste a YouTube link to process directly.' },
      { step: 3, title: 'Cut and Download', desc: 'Choose the portion to keep and download the result as an MP4 file.' },
    ],
    useCases: [
      'Quick video trimming on shared computers',
      'Editing videos when you cannot install software',
      'Processing sensitive videos locally for privacy',
      'Creating short clips for messaging apps',
    ],
    faq: [
      {
        q: 'Do I need to create an account?',
        a: 'No. The online video cutter is completely free and requires no registration or sign-up.',
      },
      {
        q: 'Does it work on mobile?',
        a: 'Yes. The cutter is fully responsive and works on both Android and iOS devices through mobile browsers.',
      },
      {
        q: 'Is there a watermark on the output?',
        a: 'No. Your cut videos are completely clean — no watermarks, no branding, no overlays.',
      },
    ],
    relatedTools: [
      { name: 'Video Cutter', path: '/video-cutter', desc: 'Cut any local video file.' },
      { name: 'YouTube Video Cutter', path: '/youtube-video-cutter', desc: 'Cut directly from YouTube videos.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
    ],
  },

  '/youtube-to-tiktok': {
    title: 'YouTube to TikTok Converter — Create TikTok Clips from YouTube',
    description:
      'Convert any YouTube video into TikTok-ready clips. Auto-crop to vertical 9:16, trim to optimal length, and download free — perfect for TikTok creators.',
    canonicalPath: '/youtube-to-tiktok',
    keywords:
      'youtube to tiktok, youtube to tiktok converter, tiktok video maker, create tiktok from youtube, youtube tiktok clipper, convert youtube to tiktok',
    h1: 'YouTube to TikTok Converter',
    intro:
      'Turn any YouTube video into TikTok-ready clips. This converter handles everything — downloading the video, cropping to TikTok\'s vertical 9:16 format, and creating clips at the perfect length for maximum engagement.',
    features: [
      {
        title: 'TikTok-Optimized Format',
        desc: 'Automatic 9:16 vertical crop matches TikTok\'s video specifications exactly.',
      },
      {
        title: 'Optimal Clip Length',
        desc: 'Create 30, 45, or 60-second clips — the ideal lengths for TikTok engagement and algorithm favor.',
      },
      {
        title: 'High-Quality Output',
        desc: 'H.264 MP4 encoding ensures crisp video quality that looks great on TikTok\'s platform.',
      },
      {
        title: 'Batch Creation',
        desc: 'Generate multiple TikTok clips from a single long video. Pick the best ones for posting.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste YouTube Link', desc: 'Enter the YouTube video URL you want to convert for TikTok.' },
      { step: 2, title: 'Choose TikTok Settings', desc: 'Enable vertical crop and select the clip duration that works best for your content.' },
      { step: 3, title: 'Download and Post', desc: 'Download your TikTok clips and upload them directly to your TikTok account.' },
    ],
    useCases: [
      'Repurposing YouTube content for TikTok reach',
      'Creating TikTok compilations from longer videos',
      'Extracting funny moments for TikTok',
      'Cross-posting content between platforms',
    ],
    faq: [
      {
        q: 'What video format does TikTok require?',
        a: 'TikTok requires vertical 9:16 video (1080x1920 pixels). Our converter automatically crops to this format.',
      },
      {
        q: 'How long should TikTok clips be?',
        a: 'TikTok videos can be up to 3 minutes, but 15-60 seconds tend to perform best. Our tool creates clips in these ranges.',
      },
      {
        q: 'Can I convert any YouTube video to TikTok?',
        a: 'Any publicly available YouTube video can be converted. The tool handles downloading, cropping, and splitting automatically.',
      },
    ],
    relatedTools: [
      { name: 'YouTube to Shorts', path: '/youtube-to-shorts', desc: 'Convert videos for YouTube Shorts.' },
      { name: 'YouTube to Reels', path: '/youtube-to-reels', desc: 'Create Instagram Reels from YouTube.' },
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Make Shorts from any YouTube video.' },
    ],
  },

  '/youtube-to-reels': {
    title: 'YouTube to Instagram Reels — Create Reels from YouTube Videos',
    description:
      'Convert YouTube videos into Instagram Reels format. Auto-crop to vertical 9:16, trim to 60s, and download free — optimized for Instagram engagement.',
    canonicalPath: '/youtube-to-reels',
    keywords:
      'youtube to reels, instagram reels maker, youtube to instagram reels, create reels from youtube, reels video maker, youtube reels converter',
    h1: 'YouTube to Instagram Reels Converter',
    intro:
      'Repurpose your YouTube content for Instagram Reels. This converter downloads any YouTube video, crops it to the vertical 9:16 format Instagram Reels requires, and creates clips optimized for maximum reach on Instagram.',
    features: [
      {
        title: 'Instagram-Ready Format',
        desc: 'Automatic 9:16 vertical crop produces Reels that fill the entire mobile screen on Instagram.',
      },
      {
        title: 'Optimized Duration',
        desc: 'Create 30, 45, or 60-second clips — the sweet spot for Instagram Reels engagement.',
      },
      {
        title: 'Clean Output',
        desc: 'No watermarks or logos. Just clean MP4 files ready to upload directly to Instagram.',
      },
      {
        title: 'Batch Processing',
        desc: 'Generate multiple Reels from a single YouTube video. Select and post the strongest clips.' },
    ],
    howItWorks: [
      { step: 1, title: 'Paste YouTube Link', desc: 'Enter any YouTube video URL. The tool fetches the video and prepares it for conversion.' },
      { step: 2, title: 'Enable Reels Mode', desc: 'Turn on vertical crop and select your preferred clip length for Instagram Reels.' },
      { step: 3, title: 'Download and Upload', desc: 'Download your Reels and upload them to Instagram. No editing needed.' },
    ],
    useCases: [
      'Cross-posting YouTube content to Instagram',
      'Creating Reels from tutorial highlights',
      'Repurposing interviews into bite-sized Reels',
      'Growing Instagram reach with YouTube content',
    ],
    faq: [
      {
        q: 'What are the Instagram Reels dimensions?',
        a: 'Instagram Reels use a 9:16 vertical aspect ratio (1080x1920 pixels). Our tool automatically crops to these dimensions.',
      },
      {
        q: 'How long can Instagram Reels be?',
        a: 'Instagram Reels can be up to 90 seconds. Our tool creates 30, 45, or 60-second clips that work well for Reels.',
      },
      {
        q: 'Can I add music to the Reels?',
        a: 'The downloaded clips include the original audio. You can add music through Instagram\'s editor after uploading.',
      },
    ],
    relatedTools: [
      { name: 'YouTube to TikTok', path: '/youtube-to-tiktok', desc: 'Create TikTok clips from YouTube.' },
      { name: 'YouTube to Shorts', path: '/youtube-to-shorts', desc: 'Convert to YouTube Shorts format.' },
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Make Shorts from YouTube videos.' },
    ],
  },

  '/podcast-to-shorts': {
    title: 'Podcast to Shorts — Extract Highlight Clips from Podcasts',
    description:
      'Turn podcast videos into short clips for TikTok, Reels, and Shorts. Free tool extracts the best moments from long podcast episodes automatically.',
    canonicalPath: '/podcast-to-shorts',
    keywords:
      'podcast to shorts, podcast clipper, extract podcast highlights, podcast to tiktok, podcast clips maker, podcast video clips, long podcast to shorts',
    h1: 'Podcast to Shorts — Extract Highlight Clips',
    intro:
      'Long podcast episodes are gold mines for short-form content. Our Podcast to Shorts tool automatically extracts highlight clips from any podcast video on YouTube — ready to post as TikToks, Reels, or Shorts.',
    features: [
      {
        title: 'Works with Any Podcast',
        desc: 'Paste any YouTube podcast link. Joe Rogan, Lex Fridman, Huberman Lab — any podcast works.',
      },
      {
        title: 'Automatic Splitting',
        desc: 'The tool divides the podcast into 30, 45, or 60-second highlight segments automatically.',
      },
      {
        title: 'Vertical Format',
        desc: 'Enable 9:16 crop to create mobile-optimized clips for TikTok, Reels, and Shorts.',
      },
      {
        title: 'Batch Extraction',
        desc: 'A 2-hour podcast produces up to 240 one-minute clips. Select the most engaging moments.' },
    ],
    howItWorks: [
      { step: 1, title: 'Paste the Podcast Link', desc: 'Enter the YouTube URL of the podcast episode you want to clip.' },
      { step: 2, title: 'Choose Clip Settings', desc: 'Select duration and enable vertical crop for short-form platforms.' },
      { step: 3, title: 'Download Highlights', desc: 'Preview all clips, pick the most engaging moments, and download them.' },
    ],
    useCases: [
      'Creating TikTok clips from Joe Rogan clips',
      'Extracting key insights from tech podcasts',
      'Building a short-form content pipeline from podcasts',
      'Repurposing podcast episodes for social media growth',
    ],
    faq: [
      {
        q: 'Does this work with any podcast on YouTube?',
        a: 'Yes. As long as the podcast is available on YouTube as a public video, you can extract clips from it.',
      },
      {
        q: 'How many clips can I get from one podcast?',
        a: 'A 2-hour podcast with 60-second clips yields about 120 clips. With 30-second clips, you get about 240.',
      },
      {
        q: 'Can the clips include subtitles?',
        a: 'The tool downloads the original audio and video. Subtitles can be added during upload to TikTok or Instagram.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts from any YouTube video.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
      { name: 'YouTube to TikTok', path: '/youtube-to-tiktok', desc: 'Convert videos to TikTok format.' },
    ],
  },

  '/ai-video-clipper': {
    title: 'AI Video Clipper — Smart Automatic Video Clipping Tool',
    description:
      'AI-powered video clipper that automatically identifies the best moments in videos and creates engaging short clips. Free, browser-based, and getting smarter.',
    canonicalPath: '/ai-video-clipper',
    keywords:
      'ai video clipper, ai clip maker, automatic video clipper, smart video clipping, ai video editor, ai shorts maker, automatic highlight detection',
    h1: 'AI Video Clipper — Smart Automatic Video Clipping',
    intro:
      'The future of video clipping is intelligent automation. Our AI Video Clipper analyzes videos and creates short clips optimized for engagement. Currently available with manual clipping — AI auto-detection features are coming soon.',
    features: [
      {
        title: 'Smart Clipping',
        desc: 'Currently: Choose clip duration and the tool splits automatically. Coming soon: AI detects the most engaging moments.',
      },
      {
        title: 'Multi-Platform Export',
        desc: 'Output clips optimized for TikTok, Instagram Reels, YouTube Shorts, and Twitter/X video.',
      },
      {
        title: 'Browser-Based',
        desc: 'No software installation required. Works in Chrome, Firefox, Safari, and Edge.',
      },
      {
        title: 'Coming: AI Captions',
        desc: 'Automatic subtitle generation for your clips — making them accessible and more engaging. Launching soon.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Upload or Paste URL', desc: 'Provide a YouTube link or upload a video file from your device.' },
      { step: 2, title: 'Select Settings', desc: 'Choose clip duration and format. AI features will automate this in the future.' },
      { step: 3, title: 'Download Clips', desc: 'Preview and download your generated clips, ready for any platform.' },
    ],
    useCases: [
      'Content creators seeking automated clipping workflows',
      'Social media teams scaling video content production',
      'Podcasters who need consistent short-form output',
      'Marketers creating video ad clips from longer content',
    ],
    faq: [
      {
        q: 'Is the AI video clipper free?',
        a: 'Yes. The core clipping tool is completely free. Advanced AI features will be available in future updates.',
      },
      {
        q: 'When will AI auto-detection be available?',
        a: 'We are actively developing AI features including highlight detection, auto-captions, and smart reframing. Stay tuned for updates.',
      },
      {
        q: 'Can I use this for commercial content?',
        a: 'Yes. You own the clips you create. Use them for personal projects, commercial content, or client work.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts from YouTube videos.' },
      { name: 'Podcast to Shorts', path: '/podcast-to-shorts', desc: 'Extract clips from podcast videos.' },
    ],
  },

  '/free-youtube-clipper': {
    title: 'Free YouTube Clipper — 100% Free, No Watermark, No Sign-up',
    description:
      'The free YouTube clipper that actually works. Download, split, and crop YouTube videos into clips — completely free with no watermarks, no sign-up, no limits.',
    canonicalPath: '/free-youtube-clipper',
    keywords:
      'free youtube clipper, youtube clipper free, free video clipper, youtube clip tool free, no watermark video clipper, free youtube downloader clips',
    h1: 'Free YouTube Clipper — No Watermark, No Limits',
    intro:
      'Most "free" video tools hit you with watermarks, sign-up walls, or usage limits. This YouTube clipper is genuinely free — open source, no watermarks, no account required, and no restrictions on how many clips you can create.',
    features: [
      {
        title: 'Truly Free',
        desc: 'No premium tier, no hidden costs, no credit card. Every feature is available to every user, always.',
      },
      {
        title: 'No Watermarks',
        desc: 'Your clips are clean. No logos, no branding, no "Made with" overlays — just your content.',
      },
      {
        title: 'Open Source',
        desc: 'The entire codebase is on GitHub. Audit it yourself, contribute, or self-host on your own server.',
      },
      {
        title: 'No Account Required',
        desc: 'No sign-up, no email, no tracking. Just paste a link and start creating clips immediately.',
      },
    ],
    howItWorks: [
      { step: 1, title: 'Paste a YouTube Link', desc: 'No account needed. Just paste any YouTube video URL into the tool.' },
      { step: 2, title: 'Choose Your Settings', desc: 'Pick clip duration and format. Enable vertical crop for Shorts, TikTok, or Reels.' },
      { step: 3, title: 'Download Clean Clips', desc: 'Download your clips instantly — no watermarks, no restrictions, no sign-up walls.' },
    ],
    useCases: [
      'Creators who cannot afford premium editing tools',
      'Students making video projects on a budget',
      'Small businesses creating social media content',
      'Anyone who values privacy and simplicity',
    ],
    faq: [
      {
        q: 'Is this really free? What\'s the catch?',
        a: 'There is no catch. YouTube Clipper is open-source software. It is free because it is a community project, not a commercial product.',
      },
      {
        q: 'Are there any usage limits?',
        a: 'No. You can create as many clips as you want, from as many videos as you want, with no daily or monthly limits.',
      },
      {
        q: 'How does it make money?',
        a: 'It doesn\'t. YouTube Clipper is a free, open-source project. If you find it useful, consider starring the GitHub repository.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Full-featured YouTube clip tool.' },
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts from any video.' },
      { name: 'Online Video Cutter', path: '/online-video-cutter', desc: 'Cut any video in your browser.' },
    ],
  },

  '/youtube-shorts-dimensions': {
    title: 'YouTube Shorts Dimensions & Aspect Ratio Guide (2026)',
    description:
      'Complete guide to YouTube Shorts dimensions, aspect ratios, and video specifications. Learn the exact resolution, duration, and format for Shorts.',
    canonicalPath: '/youtube-shorts-dimensions',
    keywords:
      'youtube shorts dimensions, youtube shorts size, youtube shorts aspect ratio, youtube shorts resolution, youtube shorts format, youtube shorts resolution 2026',
    h1: 'YouTube Shorts Dimensions & Aspect Ratio Guide',
    intro:
      'Getting the video dimensions right is crucial for YouTube Shorts performance. This guide covers everything you need to know about Shorts resolution, aspect ratio, file size, and format — plus how our tool handles it automatically.',
    features: [
      {
        title: 'Exact Specifications',
        desc: 'YouTube Shorts require a 9:16 aspect ratio at 1080x1920 pixels. Our tool crops to these exact dimensions.',
      },
      {
        title: 'Duration Limits',
        desc: 'Shorts must be 60 seconds or less. The tool splits longer videos into compliant segments automatically.',
      },
      {
        title: 'Format Requirements',
        desc: 'YouTube recommends MP4 (H.264) with AAC audio. Our output matches these specifications exactly.',
      },
      {
        title: 'Automatic Compliance',
        desc: 'Enable "Shorts Mode" and the tool handles all dimensions and formatting — you just upload to YouTube.' },
    ],
    howItWorks: [
      { step: 1, title: 'Understanding Shorts Specs', desc: 'YouTube Shorts: 1080x1920 (9:16), max 60 seconds, MP4 H.264 format.' },
      { step: 2, title: 'Use Our Tool', desc: 'Paste your YouTube link, enable Shorts Mode, and the tool handles dimensions automatically.' },
      { step: 3, title: 'Upload to YouTube', desc: 'Download the clip and upload as a Short on YouTube — dimensions are already correct.' },
    ],
    useCases: [
      'Creators who need correct Shorts dimensions',
      'Social media managers optimizing video specs',
      'Understanding platform requirements before posting',
      'Troubleshooting why Shorts look wrong on YouTube',
    ],
    faq: [
      {
        q: 'What are the exact YouTube Shorts dimensions?',
        a: 'YouTube Shorts require 1080x1920 pixels (9:16 aspect ratio). This is the vertical, full-screen mobile format.',
      },
      {
        q: 'Can I upload a horizontal video as a Short?',
        a: 'YouTube will crop it automatically, but it looks bad. Our tool pre-crops to 9:16 so your Short looks professional.',
      },
      {
        q: 'What is the maximum Shorts length?',
        a: 'YouTube Shorts can be up to 60 seconds. Our tool creates clips within this limit.',
      },
    ],
    relatedTools: [
      { name: 'YouTube Shorts Maker', path: '/youtube-shorts-maker', desc: 'Create Shorts with correct dimensions.' },
      { name: 'YouTube to Shorts', path: '/youtube-to-shorts', desc: 'Convert videos to Shorts format.' },
      { name: 'YouTube Clipper', path: '/youtube-clipper', desc: 'Download and split YouTube videos.' },
    ],
  },
};

export default landingPages;
