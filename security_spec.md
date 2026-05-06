# Security Specification for SeguidoresExpress

## Data Invariants
- A user can only read their own user document.
- A user can only read their own orders.
- A user can only read their own transactions.
- Users cannot modify their own balance directly via client SDK (must be done via system logical triggers, simulated here as restricted updates).
- Minimum order quantity is 100.
- Costs must match the service rates (TikTok: 500/100, Instagram: 300/100).

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing**: Creating an order with another user's `userId`.
2. **Balance Extraction**: Directly updating the `balance` field in `users` collection.
3. **Price Manipulation**: Creating an order with a cost lower than the defined rates.
4. **Invalid IDs**: Using a document ID with malicious characters.
5. **PII Leak**: Probing for other users' emails or phone numbers.
6. **State Jumping**: Creating an order with status already set to 'completed'.
7. **Negative Quantity**: Creating an order with 0 or negative followers.
8. **Impersonation**: Updating a profile name of another user.
9. **Orphaned Order**: Creating an order for a user ID that doesn't exist.
10. **Shadow Fields**: Adding an `isAdmin: true` field to a user document.
11. **Timestamp Forgery**: Providing a `createdAt` date from the future or past instead of server timestamp.
12. **Illegal Status Change**: A user trying to change their order status to 'completed' manually.

## Test Runner (Conceptual/Draft for firestore.rules.test.ts)
The rules will be tested against these payloads to ensure `PERMISSION_DENIED`.
