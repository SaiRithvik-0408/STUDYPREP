# Day 16: Modern AI & Multi-Query Expansion

Users often phrase queries poorly. In **Multi-Query Retrieval**, we ask an LLM to generate 3 different search variations of the user's question, run vector search on all 3 in parallel, and merge the unique document chunks.