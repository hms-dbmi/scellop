---
"scellop": patch
---

Upgrade visx from 3 to 4. visx 4 drops prop-types and lodash, requires React 18 or 19, and moves d3-shape and d3-path to 3. There is no API change for consumers of this package; the bundle shrinks by roughly 40 kB.
