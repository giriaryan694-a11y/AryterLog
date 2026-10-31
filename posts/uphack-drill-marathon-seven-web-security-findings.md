Written By Aryan Giri

# UPHACK Drill Marathon: Seven Web Security Findings

This write-up documents seven UPHACK drills covering business-logic weaknesses, HTTP request handling, mass assignment, object-level authorization, method override behavior, legacy authentication handling, and transaction-accounting logic.

The screenshots below use the exact GitHub attachment URLs supplied with the original notes. The initial server-response screenshot for Drill 04 was not included in the source material, so that location is explicitly marked as missing rather than replaced with an invented URL.

---

## Drill 01: The Deadline in Your Own Time

**Category:** Business Logic  
**Difficulty:** Easy  
**Status:** Solved

### Initial request

The first request was submitted using the application's normal deadline-handling flow.

![Initial request](https://github.com/user-attachments/assets/49e3e396-5e3f-4119-aaa9-8f612d1d010b)

### Modified request

The request was modified to test whether client-supplied time-zone and offline-mode values influenced the deadline decision.

![Modified request](https://github.com/user-attachments/assets/1d549ae0-dd9b-4326-b9d1-9653b3e5fb7d)

### Server response

![Server response](https://github.com/user-attachments/assets/6b1dfcff-d6eb-4ae1-919d-67ddefe4a434)

### Vulnerability analysis

**Vulnerability:** Client-controlled time-zone manipulation.

**Root cause:** The application trusted client-supplied time-zone and offline-mode parameters while evaluating submission deadlines.

**Parameters tested:**
- `tz`
- `offline`

**Impact:** An expired examination attempt was accepted as a timely submission.

**Remediation:**
- Evaluate deadlines using server-controlled time.
- Apply a trusted, server-side deadline policy.
- Treat client-provided time-zone and workflow flags as untrusted input.
- Keep the authoritative submission timestamp on the server.

**Key learning:** Security-critical deadline checks must not depend on values controlled by the client.

---

## Drill 02: One Character Longer

**Category:** HTTP  
**Difficulty:** Medium  
**Status:** Solved

### Initial request

The initial request targeted the internal billing ledger endpoint:

`GET /internal/billing/ledger`

![Initial request](https://github.com/user-attachments/assets/a4cd40e1-da73-4d75-bbfb-5bd78da4f965)

**Initial response:** `403 Forbidden`

The billing ledger was inaccessible through the original request.

### Initial testing

I tested two path variations:

- Appending `%09` (Horizontal Tab)
- Appending `%0C` (Form Feed)

Both attempts returned:

`404 Not Found`

These variations did not reach the intended application route.

### Modified request

The successful variation added a trailing slash to the endpoint:

`GET /internal/billing/ledger/`

![Modified request](https://github.com/user-attachments/assets/f81197dd-641f-4e1a-be18-27338214e4fe)

### Server response

![Server response](https://github.com/user-attachments/assets/cebceeb7-d9f5-4c2b-9400-2316c74ebcf8)

### Vulnerability analysis

**Vulnerability:** HTTP request path normalization inconsistency.

**Root cause:** The reverse proxy (nginx) and the Node.js application handled or normalized the request path differently. This created inconsistent access-control behavior between the proxy and the backend.

**Key observation:** The original path returned `403`, while the trailing-slash variation was handled differently and reached the intended route.

**Impact:** Potential unauthorized access to a restricted internal billing endpoint.

**Remediation:**
- Normalize request paths consistently across the reverse proxy and backend.
- Apply authorization checks in the application, not only at the proxy.
- Ensure proxy routing and backend routing rules agree.
- Test access control against alternate representations of the same route.

**Key learning:** Different path-normalization behavior between infrastructure layers can undermine access-control rules.

---

## Drill 03: Approved on Arrival

**Category:** Privilege Escalation  
**Difficulty:** Medium  
**Status:** Solved

### Initial request

The normal claim-submission request used:

`POST /api/claims`

The JSON body contained these properties:

- `amount`
- `category`
- `note`

![Initial request](https://github.com/user-attachments/assets/05d11b22-df53-44a8-849d-e4e37b8abe63)

### Initial server response

![Initial server response](https://github.com/user-attachments/assets/4cb1bfc4-5445-4a34-ad26-d2ddb263899c)

**HTTP status:** `201 Created`

The server created claim `44712` with:

```json
{
  "status": "submitted"
}
```

The response also identified an approver and a queue position.

### Modified request

I added a `status` property to the JSON request body:

![Modified request](https://github.com/user-attachments/assets/14786440-db0d-4891-8ab9-3d5f7ea57c40)

```json
{
  "amount": 1340.00,
  "category": "travel",
  "note": "Client visit, Leeds",
  "status": "approved"
}
```

### Server response

![Server response](https://github.com/user-attachments/assets/997cb87d-0cb5-4d74-9e34-904baff39386)

**HTTP status:** `201 Created`

The server created claim `44713` with the following values:

- **Status:** `approved`
- **Approver:** `null`
- **Queue position:** `null`

The claim was created directly in the approved state, without the normal approval workflow represented in the initial response.

### Vulnerability analysis

**Vulnerability:** Mass Assignment.

**Root cause:** The backend accepted a client-controlled `status` property instead of restricting the request to fields the user was permitted to set.

**Impact:** A contractor could create an expense claim with an approved status without going through the intended manager-approval workflow.

**Remediation:**
- Use an explicit allowlist of accepted request properties.
- Do not let users directly assign privileged workflow states.
- Enforce authorization on every state transition.
- Separate claim creation from claim approval.
- Maintain server-side approval records and audit logs.

**Key learning:** An API accepting a property does not mean the requester is authorized to control it. Workflow state must be managed and authorized by the server.

---

## Drill 04: The Cursor Carries the Scope

**Category:** IDOR  
**Difficulty:** Medium  
**Status:** Solved

### Initial request

The request targeted the conversation-thread endpoint:

`GET /api/conversations/threads`

![Initial request](https://github.com/user-attachments/assets/008b5afc-6cc3-4e36-a134-66480e83150c)

**Initial parameters:**
- `cursor=eyJvIjoyMDR9`
- `limit=25`

The original cursor value is `eyJvIjoyMDR9`, which identifies workspace `204` in the supplied scenario.

The authenticated user belonged to workspace `204`.

### Initial server response

**Screenshot:** Not supplied in the source notes.

**HTTP status:** `200 OK`

The server returned conversations belonging to workspace `204`, along with a pagination cursor.

### Modified request

The cursor was replaced with:

`eyJvIjo4ODF9`

![Modified request](https://github.com/user-attachments/assets/bd9d8b5d-df1e-4af4-b211-7a9f7dfc9fb8)

The replacement cursor corresponded to workspace `881`.

### Server response

![Server response](https://github.com/user-attachments/assets/a117c9ef-ddbf-4bb6-b85e-1803a0d33255)

**HTTP status:** `200 OK`

The server returned:

- **Workspace:** `881`
- **Thread IDs:** `90418`, `90422`
- A new pagination cursor for workspace `881`

The response exposed conversation metadata belonging to another workspace.

### Vulnerability analysis

**Vulnerability:** Insecure Direct Object Reference (IDOR), also described as Broken Object Level Authorization (BOLA).

**Root cause:** The backend appeared to trust the workspace identifier encoded in the client-supplied pagination cursor without verifying that the authenticated user was authorized to access that workspace.

**Impact:** Potential unauthorized cross-workspace access to private conversation metadata.

**Remediation:**
- Derive workspace authorization from the authenticated session.
- Validate workspace membership on every API request.
- Bind pagination cursors to the authenticated user and authorized workspace.
- Use integrity-protected, server-validated cursors.
- Do not treat Base64 encoding as a security boundary.

### Key learning

Pagination cursors are not automatically trustworthy. If a cursor contains authorization-sensitive information, the backend must validate that information against the authenticated user's permissions.

---

## Drill 05: The Verb in the Body

**Category:** HTTP  
**Difficulty:** Medium  
**Status:** Solved

### Initial request

The request targeted the collaborator endpoint for the `glasshouse-ep` release:

`POST /catalogue/releases/glasshouse-ep/collaborators`

The request included the method-override parameter:

`_method=PUT`

It updated collaborator `119` and set the revenue split to `15`.

![Initial request](https://github.com/user-attachments/assets/279879eb-9a21-413c-854f-a469f96cc7fe)

### Initial server response

![Initial server response](https://github.com/user-attachments/assets/38443a3e-373d-476f-bf28-017ccf512482)

**HTTP status:** `200 OK`

The server confirmed the operation:

```json
{
  "action": "updated"
}
```

### Modified request

I changed the `_method` parameter from `PUT` to `DELETE`. The outer HTTP method remained `POST`.

![Modified request](https://github.com/user-attachments/assets/85cc2ec7-1e3d-47d3-ab88-b76d41633f06)

The modified body was:

```http
_method=DELETE&collaborator=119&split=15
```

### Server response

![Server response](https://github.com/user-attachments/assets/3957ab64-fbff-4ea2-89bf-7630335c03a0)

**HTTP status:** `200 OK`

The server returned:

- **Release:** `glasshouse-ep`
- **Collaborator:** `119`
- **Action:** `removed`
- **Split released:** `15`
- **Removed by:** `you@brightloom.example`

The collaborator was successfully removed.

### Vulnerability analysis

**Vulnerability:** HTTP Method Override Abuse / Broken Function-Level Authorization.

**Root cause:** The application accepted a client-controlled `_method` parameter to determine the effective HTTP method but did not enforce the manager-level authorization required for the `DELETE` operation.

**Impact:** A label assistant could perform a collaborator-removal operation intended to be restricted to managers.

**Remediation:**
- Enforce role-based authorization for destructive operations.
- Check permissions against the effective method and operation.
- Do not assume that an incoming `POST` request is harmless.
- Restrict method overrides where they are not required.
- Log and audit sensitive collaborator changes.

### Key learning

The HTTP method visible in the network request is not necessarily the method processed by the application. Review method-override behavior and enforce authorization for the operation the backend actually performs.

---

## Drill 06: The Link That Works Without It

**Category:** Authentication  
**Difficulty:** Easy  
**Status:** Solved

### Initial request

The request targeted:

`GET /preferences`

It included these parameters:

- `u=9330` (subscriber ID)
- `h=6f2ab19c` (signature)

The supplied signature belonged to my own subscriber link, not subscriber `9330`.

![Initial request](https://github.com/user-attachments/assets/f9d5824f-3a09-4343-af79-6491e5b89019)

### Initial server response

![Initial server response](https://github.com/user-attachments/assets/7fa5cd76-e750-4404-8295-24fc59b80216)

**HTTP status:** `403 Forbidden`

The server returned:

`signature_mismatch`

The supplied signature did not match the requested subscriber ID.

### Modified request

I tested the request without the signature parameter. The objective was to investigate the legacy newsletter links mentioned in the scenario.

![Modified request](https://github.com/user-attachments/assets/fe72ff34-12a2-42a2-90bc-f07fd6140c8b)

### Server response

![Server response](https://github.com/user-attachments/assets/15edc3f2-c0f5-4ec9-b72c-bc1c4455b1a2)

**HTTP status:** `200 OK`

The server returned subscriber information, including:

- Subscriber ID
- Name
- Email address
- Phone number
- Postal address
- Newsletter subscriptions

The response also contained:

```json
{
  "legacy_link": true
}
```

### Vulnerability analysis

**Vulnerability:** Authentication/Signature Validation Bypass.

**Root cause:** The application appeared to allow requests without a signature when processing legacy subscriber links, without requiring an appropriate alternative authorization mechanism.

**Impact:** Unauthorized access to another subscriber's personal information.

**Remediation:**
- Require valid authentication or authorization before returning subscriber records.
- Do not treat a missing signature as valid legacy authorization.
- Migrate legacy links to secure, time-limited tokens.
- Validate subscriber ownership on the server.
- Minimize the personal information exposed by preference endpoints.

### Key learning

Removing a security parameter can expose an unexpected legacy code path. Missing authentication data must never automatically result in trusted access.

---

## Drill 07: The Account That Multiplies Points

**Category:** Business Logic  
**Difficulty:** Not specified  
**Status:** Solved

### Initial request

The request targeted the points-transfer endpoint:

`POST /api/points/transfer`

The parameters were:

- `from=88214009`
- `to=90117442`
- `points=5000`

The transfer moved 5,000 points between two accounts owned by the same member.

![Initial request](https://github.com/user-attachments/assets/1ae466eb-96b5-4332-9b82-bcbd212e280d)

### Initial server response

![Initial server response](https://github.com/user-attachments/assets/7a2ce557-c2ed-43e5-a1b4-4b61cd505e3f)

**HTTP status:** `200 OK`

The balances changed as follows:

| Account | Before | After |
|---|---:|---:|
| Source | 41,000 | 36,000 |
| Destination | 2,500 | 7,500 |

The combined balance remained `43,500` points.

### Modified request

I changed the destination account so that it matched the source account:

```http
from=88214009&to=88214009&points=5000
```

![Modified request](https://github.com/user-attachments/assets/954e4961-e232-4a5b-a256-5987029d5f55)

Both account identifiers now referred to the same account.

### Server response

![Server response](https://github.com/user-attachments/assets/0442346b-0e7a-4453-83a1-0b60b78409df)

**HTTP status:** `200 OK`

The server reported:

- **Source balance:** `46,000`
- **Destination balance:** `46,000`
- **Moved:** `5,000`

The account balance increased from `41,000` to `46,000` after the self-transfer.

### Vulnerability analysis

**Vulnerability:** Self-transfer accounting flaw / Business Logic Vulnerability.

**Root cause:** The transfer operation appeared to process the debit and credit inconsistently when both account identifiers referred to the same account.

**Impact:** Potential unauthorized creation of loyalty points through a self-transfer.

**Remediation:**
- Reject transfers where the source and destination account IDs are identical.
- Perform debit and credit operations atomically.
- Validate ledger invariants before committing transactions.
- Use database transactions and appropriate locking.
- Maintain an immutable transaction ledger.
- Reconcile account balances against ledger entries.

### Key learning

Test relationships between input parameters, not only their individual values. Two individually valid account IDs can form an invalid business operation when used together.

---

## Consolidated findings

| Drill | Finding | Category | Reported impact |
|---|---|---|---|
| 01 | Client-controlled deadline evaluation | Business Logic | Expired attempt accepted as timely |
| 02 | Inconsistent path normalization | HTTP | Potential access to a restricted internal endpoint |
| 03 | Mass assignment of workflow state | Privilege Escalation | Claim created directly as approved |
| 04 | Trust in client-controlled pagination scope | IDOR | Cross-workspace conversation metadata exposed |
| 05 | Method override without effective-operation authorization | HTTP | Manager-restricted collaborator removal |
| 06 | Legacy path accepted without signature | Authentication | Subscriber personal information exposed |
| 07 | Self-transfer accounting flaw | Business Logic | Account balance increased through a self-transfer |

## General lessons

These drills demonstrate several recurring application-security principles:

1. **The server must own security decisions.** Deadline checks, approval states, authorization scopes, and transaction accounting must not be controlled by untrusted client input.
2. **Validate authorization at the object and operation level.** A valid session or an accepted request does not automatically authorize access to every object or action.
3. **Test alternate request representations.** Reverse proxies, frameworks, and application code may interpret paths and effective HTTP methods differently.
4. **Treat tokens and cursors as untrusted until validated.** Encoding a value does not make it tamper-proof or authorize the user represented by it.
5. **Enforce business invariants.** API operations must remain valid when parameters interact in unexpected ways, including self-transfers and privileged state changes.

---

## Screenshot source URLs

The following image URLs are reproduced from the supplied source notes:

| Drill | Screenshot | Source URL |
|---|---|---|
| 01 | Initial request | https://github.com/user-attachments/assets/49e3e396-5e3f-4119-aaa9-8f612d1d010b |
| 01 | Modified request | https://github.com/user-attachments/assets/1d549ae0-dd9b-4326-b9d1-9653b3e5fb7d |
| 01 | Server response | https://github.com/user-attachments/assets/6b1dfcff-d6eb-4ae1-919d-67ddefe4a434 |
| 02 | Initial request | https://github.com/user-attachments/assets/a4cd40e1-da73-4d75-bbfb-5bd78da4f965 |
| 02 | Modified request | https://github.com/user-attachments/assets/f81197dd-641f-4e1a-be18-27338214e4fe |
| 02 | Server response | https://github.com/user-attachments/assets/cebceeb7-d9f5-4c2b-9400-2316c74ebcf8 |
| 03 | Initial request | https://github.com/user-attachments/assets/05d11b22-df53-44a8-849d-e4e37b8abe63 |
| 03 | Initial server response | https://github.com/user-attachments/assets/4cb1bfc4-5445-4a34-ad26-d2ddb263899c |
| 03 | Modified request | https://github.com/user-attachments/assets/14786440-db0d-4891-8ab9-3d5f7ea57c40 |
| 03 | Server response | https://github.com/user-attachments/assets/997cb87d-0cb5-4d74-9e34-904baff39386 |
| 04 | Initial request | https://github.com/user-attachments/assets/008b5afc-6cc3-4e36-a134-66480e83150c |
| 04 | Initial server response | Not supplied |
| 04 | Modified request | https://github.com/user-attachments/assets/bd9d8b5d-df1e-4af4-b211-7a9f7dfc9fb8 |
| 04 | Server response | https://github.com/user-attachments/assets/a117c9ef-ddbf-4bb6-b85e-1803a0d33255 |
| 05 | Initial request | https://github.com/user-attachments/assets/279879eb-9a21-413c-854f-a469f96cc7fe |
| 05 | Initial server response | https://github.com/user-attachments/assets/38443a3e-373d-476f-bf28-017ccf512482 |
| 05 | Modified request | https://github.com/user-attachments/assets/85cc2ec7-1e3d-47d3-ab88-b76d41633f06 |
| 05 | Server response | https://github.com/user-attachments/assets/3957ab64-fbff-4ea2-89bf-7630335c03a0 |
| 06 | Initial request | https://github.com/user-attachments/assets/f9d5824f-3a09-4343-af79-6491e5b89019 |
| 06 | Initial server response | https://github.com/user-attachments/assets/7fa5cd76-e750-4404-8295-24fc59b80216 |
| 06 | Modified request | https://github.com/user-attachments/assets/fe72ff34-12a2-42a2-90bc-f07fd6140c8b |
| 06 | Server response | https://github.com/user-attachments/assets/15edc3f2-c0f5-4ec9-b72c-bc1c4455b1a2 |
| 07 | Initial request | https://github.com/user-attachments/assets/1ae466eb-96b5-4332-9b82-bcbd212e280d |
| 07 | Initial server response | https://github.com/user-attachments/assets/7a2ce557-c2ed-43e5-a1b4-4b61cd505e3f |
| 07 | Modified request | https://github.com/user-attachments/assets/954e4961-e232-4a5b-a256-5987029d5f55 |
| 07 | Server response | https://github.com/user-attachments/assets/0442346b-0e7a-4453-83a1-0b60b78409df |
