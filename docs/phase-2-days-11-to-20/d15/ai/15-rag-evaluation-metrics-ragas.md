# Day 15: Modern AI & RAG Evaluation Metrics (RAGAS)

How do you know if your RAG pipeline is working? The industry standard is **RAGAS framework**:
1. **Faithfulness**: Is the answer derived strictly from context, or did the model hallucinate?
2. **Answer Relevance**: Did the model answer the actual user prompt?
3. **Context Recall**: Did the vector search retrieve all the required chunks?