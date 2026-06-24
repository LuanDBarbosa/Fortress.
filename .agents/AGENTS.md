# Project Rules

- **Performance First**: For every new feature implementation, always verify if it is well-optimized. Specifically, check for React reconciliation bottlenecks, GPU-heavy CSS (like `backdrop-filter` during animations), and ensure event listeners are properly debounced, throttled, or bypassed when possible to maintain 144fps rendering fluidity.
