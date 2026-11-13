# Day 29: System Design (HLD) — Video Streaming Architecture

* **Video Ingestion & Transcoding**: Chunking raw MP4 into 2-second segments across multiple bitrates (1080p, 720p, 480p) using HLS (HTTP Live Streaming) / DASH.
* **CDN Edge Delivery**: Caching video chunks at ISP edge nodes worldwide to reduce buffering latency.