# Day 27: Drills, Quizzes & Practical Exercises

1. **System Design**: In TinyURL, why use Base62 instead of Base64?
   * *Answer*: Base64 contains `+` and `/`, which are reserved URL query characters that require percent-encoding. Base62 (`[a-zA-Z0-9]`) produces clean, URL-safe alphanumeric strings.