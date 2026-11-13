# Day 14: Modern AI & Document Ingestion Pipelines

Garbage in = Garbage out. RAG pipelines fail when PDF tables, footnotes, and multi-column layouts are parsed into garbled text.

---

## 1. Document Extraction Best Practices
* **Header & Footnote Stripping**: Strip repeating page headers and page numbers to prevent polluting vector space.
* **Markdown Table Preservation**: Convert tables into clean GitHub-flavored markdown tables before embedding so semantic column relationships are preserved.