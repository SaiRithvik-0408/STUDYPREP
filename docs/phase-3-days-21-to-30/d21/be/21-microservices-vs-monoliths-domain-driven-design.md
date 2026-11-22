# Day 21: Backend Engineering & Microservices Architecture

* **Modular Monolith**: Single codebase with strict domain boundaries. Easiest to deploy and test.
* **Microservices**: Independent deployable services communicating via gRPC or HTTP. Use only when team size (> 50 engineers) requires autonomous deployment pipelines.
* **Domain-Driven Design (DDD)**: Designing bounded contexts (e.g. Identity Context, Billing Context, Inventory Context) with zero shared database tables.