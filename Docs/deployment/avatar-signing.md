# Avatar Signing and Verification (Demo)

This document explains how to sign NTI avatars in the mobile approval flow and how the website demo verifies signed avatars.

1. Generate an RSA key pair for demo purposes:

```bash
openssl genpkey -algorithm RSA -out demo_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in demo_private.pem -pubout -out demo_private.pub.pem
```

2. Approve features and sign the avatar using the mobile simulator:

```bash
node packages/shared/policy-eval/demo/mobile_approve.js packages/shared/policy-eval/demo/avatars/initial_avatar.json /tmp/approved_signed_avatar.json demo_private.pem
```

The script will embed `signature` and, if present, `publicKey` (from `demo_private.pub.pem`) into the output avatar.

3. Open the browser demo and upload the signed avatar. The demo will verify the signature locally in the browser using the provided public key.

Security notes
- This demo embeds public key material in the avatar for simplicity; in production you should use a trusted key registry or signed manifest and verify key ownership.
- Consider using hardware-backed keys on the mobile app and signature envelopes (JWS/JWT or COSE) for production-grade assurance.
