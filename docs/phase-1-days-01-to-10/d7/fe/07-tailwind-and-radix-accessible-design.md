# Day 7: Frontend Engineering & Accessible Headless Design (Radix + Tailwind)

In modern frontend interviews, writing plain HTML with buttons is not enough. You must understand **Headless UI Component Architecture**, **Keyboard Navigation**, and **WAI-ARIA Accessibility Standards**.

---

## 1. The Headless Component Paradigm

```
┌────────────────────────────────────────────────────────┐
│             LEGACY UI LIBS (MUI, Ant Design)           │
├────────────────────────────────────────────────────────┤
│ Logic + Keyboard Handlers + Hardcoded Heavy CSS        │
│ * Problem: Overriding their styling requires ugly      │
│   !important hacks and increases bundle sizes.         │
└────────────────────────────────────────────────────────┘
                           vs
┌────────────────────────────────────────────────────────┐
│             HEADLESS UI (Radix UI / Shadcn)            │
├────────────────────────────────────────────────────────┤
│ 1. Logic & Accessibility Layer (Radix UI / React Aria) │
│    - Focus trap, keyboard arrows, aria-* attributes    │
│    - Zero styling (pure functional primitives)         │
├────────────────────────────────────────────────────────┤
│ 2. Styling Layer (Tailwind CSS)                        │
│    - You own 100% of the CSS with utility classes      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Anatomy of a Production-Grade Accessible Modal Dialog

An accessible Modal Dialog must satisfy strict W3C WAI-ARIA guidelines:
1. **Focus Trap**: Keyboard users pressing `Tab` must cycle exclusively through interactive elements inside the modal. Focus must never escape to the background document.
2. **Escape Key**: Pressing `Escape` must immediately close the dialog.
3. **Scroll Locking**: The background body document must be locked (`overflow: hidden`) to prevent background scrolling.
4. **Focus Restoration**: When the dialog closes, focus must immediately return to the button that triggered the modal.

```tsx
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleModal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Remember the button that opened the modal
      previousActiveElement.current = document.activeElement as HTMLElement;

      // 2. Lock background scrolling
      document.body.style.overflow = 'hidden';

      // 3. Focus modal container
      modalRef.current?.focus();

      // 4. Handle Escape key & Focus Trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        // 5. Restore focus to the triggering element
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg p-6 bg-white rounded-xl shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="py-4 text-gray-700">{children}</div>
      </div>
    </div>
  );
}
```
