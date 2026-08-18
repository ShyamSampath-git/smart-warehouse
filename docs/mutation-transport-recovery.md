# tRPC Mutation Transport Recovery

## Incident summary

On 18 August 2026, the browser reported `TRPCClientError: Failed to fetch` when submitting a tRPC mutation. Direct checks showed that the local tRPC endpoint and the preview-proxied endpoint were healthy after the development server was restarted. The failure was therefore a **stale preview transport state after the full-stack server upgrade**, rather than a rejected database mutation or a profile-ownership error.

## Safeguards retained

The client now translates unavailable-transport failures into a clear retry-oriented message while deliberately avoiding automatic mutation retries. Automatic retries are unsafe for warehouse actions because they can duplicate state changes such as advancing an order or saving a decision.

All mutation actions retain their normal success and server-error feedback. The Command Center priority queue now receives an explicit typed `onAdvance(orderId)` callback, so order progression no longer depends on DOM event delegation or table-text matching.

## Verification

After the restart and action-wiring repair, both an authenticated profile save and a Command Center order advance completed successfully in the preview. The order status persisted from `Packing` to `Quality check`.
