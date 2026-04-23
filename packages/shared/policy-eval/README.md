policy-eval — Browser-friendly NTI policy evaluator

This lightweight module provides an `evaluate()` function compatible with the server-side policy engine used by SiGear, and a convenience `evaluateFromAvatar(avatar, req)` which accepts an `avatar` JSON object containing `rules` and `consents` arrays.

It is suitable for bundling into web pages that only have access to an NTI avatar JSON file and need to make local policy decisions (offline-capable enforcement).

Usage (browser):

```html
<script type="module">
  import { evaluateFromAvatar } from '../index.js';

  const avatar = await fetch('/avatar.json').then(r => r.json());
  const req = { identityId: 'user:123', action: 'activate', purpose: 'X', context: { requestedCapabilityAxes: { A: 'enabled' } } };
  const decision = evaluateFromAvatar(avatar, req);
  console.log(decision);
</script>
```

Demo: open `demo/index.html` in a browser (file:// is OK) and upload an avatar JSON to run local evaluations.
