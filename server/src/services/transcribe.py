#!/usr/bin/env python3
"""
Whisper Transcription Service
Transcribes video/audio files using OpenAI Whisper (local model)
Returns JSON with timestamped segments
"""

import sys
import json
import os
import tempfile

def transcribe(input_path, language=None, model_size="base"):
    """
    Transcribe an audio/video file using Whisper
    
    Args:
        input_path: Path to the input video/audio file
        language: Language code (e.g., 'ar', 'en', 'es') or None for auto-detect
        model_size: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
    
    Returns:
        JSON string with transcription segments
    """
    try:
        import whisper
        import torch
    except ImportError:
        return json.dumps({"error": "Whisper not installed. Run: pip install openai-whisper"})
    
    try:
        # Load model
        print(f"[Whisper] Loading {model_size} model...", file=sys.stderr)
        model = whisper.load_model(model_size)
        
        # Transcribe
        print(f"[Whisper] Transcribing: {input_path}", file=sys.stderr)
        options = {
            "verbose": False,
            "fp16": False,  # CPU mode
        }
        if language:
            options["language"] = language
        
        result = model.transcribe(input_path, **options)
        
        # Format output
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
                "confidence": round(seg.get("avg_logprob", -1) * -1, 2),
            })
        
        output = {
            "language": result.get("language", "unknown"),
            "text": result.get("text", "").strip(),
            "segments": segments,
            "segments_count": len(segments),
        }
        
        print(f"[Whisper] Done: {len(segments)} segments", file=sys.stderr)
        return json.dumps(output, ensure_ascii=False)
        
    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <input_file> [language] [model_size]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else None
    model_size = sys.argv[3] if len(sys.argv) > 3 else "base"
    
    if not os.path.exists(input_file):
        print(json.dumps({"error": f"File not found: {input_file}"}))
        sys.exit(1)
    
    result = transcribe(input_file, language, model_size)
    print(result)
