# Day 29: Drills, Quizzes & Practical Exercises

1. **System Design**: Why does Netflix slice video files into small 2-second `.ts` chunks instead of serving a single MP4 file?
   * *Answer*: Adaptive Bitrate Streaming (HLS). Slicing allows the video player to switch seamlessly between 480p and 1080p mid-stream based on fluctuations in the user's mobile internet connection.