# Day 15: Frontend Engineering & Architecture Trade-Offs

* **Modular Monolith**: Single repository, clean package structure (`packages/ui`, `packages/auth`), single deploy pipeline. (Recommended for 95% of organizations).
* **Micro-Frontends (Webpack Module Federation)**: Separate teams deploy sub-apps independently into a single browser frame. High operational complexity.