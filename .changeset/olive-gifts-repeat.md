---
"scellop": patch
---

Replace `useStoreWithEqualityFn` from `zustand/traditional` with `useStore` plus `useShallow`. The behaviour is unchanged — selector results were already compared with zustand's `shallow`, and no caller ever passed a custom equality function — but it drops `use-sync-external-store`, a React 17 compatibility shim, from the dependency graph. The unused `equalityFn` parameter is gone from `CurriedUseStore`.
