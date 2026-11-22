# Day 28: System Design (HLD) — Real-Time Collaborative Editing

* **Operational Transformation (OT)**: Central server transforms character offsets (used by Google Docs).
* **Conflict-Free Replicated Data Types (CRDTs)**: Decentralized peer-to-peer data structures that converge automatically without a central master (e.g. Yjs, Automerge, Figma).