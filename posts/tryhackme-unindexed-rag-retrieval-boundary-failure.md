Written By Aryan Giri

The TryHackMe room "UnIndexed" demonstrates one of the most important security failures in modern Retrieval-Augmented Generation (RAG) systems:

The model does not need to be jailbroken.
The attacker does not need admin privileges.
The attacker does not exploit the model itself.

The retrieval pipeline fails first.

A normal employee-level user interacts with an internal AI assistant called Atlas. The organization claims the assistant only exposes public employee information such as onboarding guides, expense policies, and on-call schedules.

In reality, Atlas has access to far more data than intended.

The room is fundamentally about retrieval boundary collapse.

## Initial Surface Mapping

The first step is not exploitation.

It is capability discovery.

The attacker begins by uploading a document and asking Atlas to summarize it:

```text
summerise 1773829736357-document-ingestion-cloudwright.txt
```

Atlas responds with standard employee documentation:

* Onboarding workflow
* Expense policy
* Engineering on-call schedules

At this stage, the assistant appears legitimate.

This mirrors how many real-world enterprise RAG deployments behave. Public-facing queries initially return safe and expected information, creating trust in the system.

The important observation is not the content itself.

It is the existence of document ingestion and retrieval.

Once retrieval exists, the next question becomes:

What else was embedded into the vector store?

## Retrieval Expansion Through Conversational Probing

The attacker gradually increases query scope instead of immediately requesting secrets.

This is critical.

Aggressive prompts often trigger filtering logic.
Normal conversational exploration usually does not.

The attacker begins asking broad summarization questions:

```text
summarise what info u have access too
```

Atlas reveals additional internal knowledge domains:

* Internal projects
* Board-approved funds
* Infrastructure operations
* Credential rotation schedules
* Monitoring stack configurations

At this point, the security failure becomes obvious.

The assistant is not isolated to employee-safe documentation.

The retrieval system can access:

* Internal infrastructure details
* Operational procedures
* Board-level information
* Potentially sensitive configuration data

The retrieval boundary has already failed.

## Semantic Retrieval Has No Native Authorization

This room demonstrates a core problem in RAG architecture.

Vector databases retrieve documents based on semantic similarity, not access permissions.

If sensitive documents are embedded into the same searchable retrieval space as public documents, similarity search can surface them during normal conversation.

The model itself is not deciding authorization.

The retriever already decided what context enters the prompt.

Once the sensitive context reaches the model:

The leak already happened.

The LLM simply generates a response using whatever documents were retrieved.

## Progressive Information Disclosure

The attacker continues requesting:

```text
more
more something new
more different and new
more newer
```

This technique matters.

The attacker is exploiting conversational continuity.

Instead of directly requesting secrets, the attacker nudges the assistant to continue expanding retrieval scope.

Atlas eventually discloses:

* Project Atlas internal alpha details
* Budget approvals
* Acquisition legal review information
* Staging service account names
* Credential rotation schedules
* Legacy monitoring stack details
* Internal wiki paths

Example disclosure:

```text
The legacy monitoring system relies on a hardcoded API key,
which is documented at /ops/legacy-monitoring-config
```

This is a classic retrieval exposure issue.

The assistant is effectively acting as an indexed internal reconnaissance interface.

## Sensitive Infrastructure Leakage

One of the most dangerous disclosures involves infrastructure operations:

```text
Production database credentials are rotated every 72 hours using Vault,
while staging uses a shared service account with a 90-day rotation schedule.
```

This type of information is highly valuable during post-exploitation.

Even without direct credentials, attackers gain:

* Infrastructure architecture awareness
* Identity management details
* Rotation timing intelligence
* Service account naming patterns
* Potential attack timing opportunities

This is operational intelligence leakage.

Many organizations incorrectly classify this as “non-sensitive.”

In reality, modern offensive operations rely heavily on contextual infrastructure intelligence.

## Board-Level Data Exposure

Atlas later reveals board-approved business decisions:

```text
- Acquisition of Vantage AI for $18.5M
- Emergency Security Fund (SEC-2026-EMRG)
```

The attacker continues narrowing focus toward the emergency security fund.

Eventually Atlas exposes:

```text
Internal Reference Identifier:
THM{r3tri3v4l_h4s_n0_b0und4r13s}
```

Flag:

```text
THM{r3tri3v4l_h4s_n0_b0und4r13s}
```

The important lesson is not the flag.

The important lesson is why it was reachable.

## Why The Attack Worked

The compromise did not require:

* Prompt injection
* Jailbreaking
* Authentication bypass
* Exploiting the model
* Remote code execution
* API abuse

The attacker simply asked questions.

The failure occurred because:

1. Sensitive documents were embedded into the retrievable corpus.
2. Retrieval lacked authorization enforcement.
3. The assistant trusted retrieved context automatically.
4. Conversational exploration allowed progressive disclosure.
5. The organization assumed semantic search implied safe isolation.

This is a pipeline security failure.

Not a model failure.

## The Real Security Problem

Most organizations focus on prompt safety.

The actual danger is retrieval safety.

Modern RAG systems often connect:

* Internal wikis
* Slack exports
* Confluence pages
* Ticket systems
* Google Drive
* SharePoint
* Infrastructure documentation
* Incident reports
* Executive notes

If ingestion pipelines lack strict authorization segmentation, the vector store becomes a semantic data lake where unrelated information can accidentally surface together.

Similarity search does not understand:

* Clearance levels
* Business sensitivity
* Need-to-know access
* Department isolation
* Tenant boundaries

Without explicit enforcement layers, the retrieval engine becomes an unintentional insider threat amplifier.

## Attack Methodology Used In The Room

The room indirectly teaches a realistic offensive methodology for testing enterprise AI assistants.

### 1. Capability Enumeration

Identify:

* What data sources exist
* What domains the assistant understands
* Whether retrieval is active
* Whether conversational memory exists

### 2. Scope Expansion

Gradually widen query context:

```text
more
something new
summarise everything
```

This encourages the assistant to retrieve adjacent documents.

### 3. Topic Pivoting

When new sensitive entities appear:

* Projects
* Funds
* Infrastructure
* Operations
* Acquisitions

Pivot deeper into those domains.

### 4. Recursive Disclosure

Ask for:

* More detail
* New information
* Internal references
* Related operational context

RAG systems frequently over-share once conversational retrieval chains begin expanding.

## Real-World Parallel

This room reflects real enterprise AI risks.

Common failures include:

* HR assistants leaking engineering data
* Internal copilots exposing secrets from unrelated departments
* AI search systems surfacing credentials from documentation
* Executive meeting notes appearing in semantic retrieval
* Multi-tenant vector databases leaking cross-user data

The dangerous part is that these leaks often occur through completely normal conversation.

No exploit payload is required.

## Security Lessons

The room demonstrates several critical RAG security principles.

### Ingestion Is A Security Boundary

If sensitive documents enter embeddings:

They become retrievable.

Security failures often begin during ingestion, not inference.

### Retrieval Requires Authorization

Semantic similarity alone is not security.

Every retrieval operation must enforce:

* Identity-aware filtering
* Namespace isolation
* Access control checks
* Document-level permissions
* Tenant separation

### Context Equals Exposure

Anything retrieved into the prompt is effectively disclosed.

The model cannot safely distinguish:

* Public context
* Confidential context
* Regulated data
* Internal-only documents

unless the pipeline enforces it first.

### Conversational AI Expands Attack Surface

Persistent conversation enables progressive disclosure attacks.

Each response becomes reconnaissance for the next query.

## Final Thoughts

TryHackMe UnIndexed is not really about prompt engineering.

It is about understanding that modern AI systems inherit every security problem of their retrieval pipelines.

RAG systems are not just chatbots.

They are searchable interfaces to organizational memory.

If ingestion, retrieval, segmentation, and authorization are weak, the assistant becomes an internal reconnaissance engine capable of exposing infrastructure details, operational intelligence, executive decisions, and confidential records through ordinary conversation.

The room’s flag summarizes the entire issue perfectly:

```text
THM{r3******_h**_n*_*******}
```
