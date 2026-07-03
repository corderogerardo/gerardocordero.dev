# PawWalk API Contract

This is the human-readable mirror of the Pydantic models in `app/schemas.py`
(module 23's "contract loop"). The models are the source of truth; this file
documents behavior that isn't visible from the schema alone.

## Auth

`POST /auth/signup` and `POST /auth/login` both return an `AuthResponse`:
`access_token`, `token_type` (always `"bearer"`), and `user`. Send the token
back as `Authorization: Bearer <access_token>` on every subsequent request.

## Bookings

A booking has a `status` that moves through `pending -> confirmed ->
in_progress -> completed` (or `cancelled`). Prices are always in
**cents** (`price_cents`), never floating-point dollars, to avoid rounding
errors. `duration_minutes` is one of `30`, `45`, or `60` — no other value
is accepted.

## Cancellation policy

An owner can cancel a booking any time before it moves to `in_progress`.
Cancelling a `confirmed` booking within 2 hours of the start time still
counts as a cancellation, but the walker is notified immediately so they
can fill the slot. There is no cancellation fee in this reference app —
production PawWalk would enforce one via the Stripe PaymentIntent.

## Payments

`POST /payments/intent` creates a Stripe PaymentIntent for a booking's
`price_cents` and returns a `client_secret` the mobile app uses to finish
the charge directly with Stripe. If no Stripe key is configured, a stub
`client_secret` is returned with the identical response shape. Stripe
confirms the charge asynchronously via `POST /payments/webhook`.

## Errors

`401` means the request has no valid identity (missing/expired/invalid
token). `403` means the identity is known but not allowed to do this
action. A booking that belongs to someone else returns `404`, not `403` —
the backend doesn't confirm it exists.
