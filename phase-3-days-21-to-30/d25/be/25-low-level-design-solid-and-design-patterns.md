# Day 25: Backend Engineering & Low-Level Design (LLD)

### 1. The Strategy Pattern in TypeScript
```typescript
interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}

class StripeStrategy implements PaymentStrategy {
  async pay(amount: number) { console.log(`Paid ${amount} with Stripe`); }
}

class PayPalStrategy implements PaymentStrategy {
  async pay(amount: number) { console.log(`Paid ${amount} with PayPal`); }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  async process(amount: number) { await this.strategy.pay(amount); }
}
```