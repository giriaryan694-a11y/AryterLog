Written By Aryan Giri

# If Prompting Becomes Programming, Does AI Safety Become the New Programming Boundary?

There is a fundamental shift happening in how humans interact with computers.

For decades, programming required people to learn a formal language. A developer had to understand Python, C, C++, JavaScript, Rust, shell scripting, or another language well enough to translate an idea into instructions a computer could execute.

That model is beginning to change.

Modern coding agents can already take natural-language requirements, inspect codebases, create and modify files, run tests, debug failures, and work through substantial engineering tasks. OpenAI describes Codex as an agent that can handle features, refactors, migrations, testing, code review, and other software-engineering work end to end. OpenCode describes itself as an open-source coding agent available through terminal, desktop, and IDE interfaces.

The future implied by this trajectory is larger than better autocomplete.

It is the possibility that natural language itself becomes a practical programming interface.

And that creates an uncomfortable policy question:

> If prompting eventually becomes programming, could excessively restrictive AI safeguards become a new boundary around what people are allowed to explore on their own computers?

This does not mean AI systems should have no safeguards. They clearly need them.

The more interesting argument is that AI safety should become increasingly capable of distinguishing harmful real-world abuse from legitimate education, experimentation, research, and controlled laboratory work.

## Programming has always been dual-use

Computing is fundamentally full of dual-use capabilities.

Python can be used to build a web application, automate administrative tasks, analyze scientific data, conduct security research, or create malicious software.

C and C++ can be used for ordinary applications, operating-system components, embedded systems, device drivers, and low-level security research. The same low-level control can also be abused.

JavaScript powers websites, browser applications, servers, automation, developer tooling, and countless legitimate services. Its capabilities can also be incorporated into abusive software.

Networking APIs can create a harmless local server, a distributed application, a monitoring system, or infrastructure that is used maliciously.

Cryptographic libraries can protect confidential communications and data, while cryptographic primitives can also appear inside malicious software.

Firmware development can produce legitimate embedded devices while also providing extremely powerful access to hardware.

The important observation is not that these technologies are harmless.

They are not.

The observation is that their dual-use nature has generally not resulted in the underlying programming language becoming a moral gatekeeper.

A compiler does not normally ask why a developer is calling a networking API.

It does not determine whether process management is being used for a legitimate service or an abusive program.

It does not refuse to compile a cryptographic routine simply because cryptography can appear in malicious software.

A hypothetical GCC that refused to compile programs whenever they contained networking, process-management, encryption, or other dual-use functionality would make ordinary software engineering extraordinarily difficult.

The capability itself is not the same thing as the harmful application of that capability.

That distinction matters enormously for AI.

## But an AI coding agent is not a compiler

The compiler analogy has an important limitation.

A compiler is primarily a deterministic translation mechanism. It takes source code and transforms it into another representation according to defined rules.

An AI coding agent is much more capable at the interaction layer.

It can interpret ambiguous requirements.

It can reason about architecture.

It can write large amounts of code.

It can inspect an existing project.

It can run commands.

It can observe failures.

It can modify its implementation.

It can interact with external tools.

And increasingly, it can operate over longer workflows.

Codex, for example, is explicitly positioned as an agent capable of handling substantial engineering work, including building features, complex refactors, migrations, testing, and review. OpenAI has also described the Codex app as supporting workflows where multiple agents can work across projects over extended periods.

OpenCode provides another view of this direction: it operates as an agent through terminal, desktop, and IDE environments, with separate planning and build-oriented workflows.

This distinction is important.

A compiler executes what the programmer has already expressed.

An agent can increasingly participate in expressing the program itself.

That makes safety controls more important.

It also makes context-sensitive safety more important.

## MCP makes the boundary even more interesting

The evolution is not limited to code generation.

The Model Context Protocol provides a standardized way for AI systems to interact with external capabilities. Its specification describes three major primitives: prompts, resources, and tools. Tools are executable functions that can allow models to perform actions or retrieve information.

This creates an architectural progression:

```text
Natural language
       |
       v
      AI
       |
       v
   Generated code
       |
       v
   Local tools
       |
       v
 External systems
```

The important part is the bottom half.

An AI that can only produce text is one thing.

An AI that can write files, execute code, interact with a browser, access a database, communicate with APIs, or operate development infrastructure is another.

Hermes is an example of this broader agent architecture. Its documentation describes terminal and file tools, browser automation, code execution, delegation, and MCP integrations. Its MCP integration allows external tools such as GitHub, databases, filesystems, browser systems, and APIs to become available to the agent.

This is exactly why AI safety cannot simply copy the safety model of a programming language.

The AI can sit between the human and a large collection of computational capabilities.

That makes authorization, environment, target, and consequences important parts of the safety decision.

## The future "AI programming language"

Imagine a future where somebody can say:

> "Build me a local application that monitors my network, stores the results in a database, provides a web interface, and runs as a service."

The person may not know Python.

They may not know Rust.

They may not know SQL.

They may not know how to structure a web application.

But the AI could potentially create the project, select appropriate technologies, write the components, test them, debug failures, and explain the architecture.

This future has not completely arrived.

However, the direction is already visible in today's coding agents.

If that trajectory continues, programming knowledge itself may change.

The valuable skill may become less about memorizing syntax and more about understanding:

* system architecture;
* requirements;
* operating systems;
* networking;
* databases;
* security;
* debugging;
* testing;
* interfaces;
* failure modes;
* computational consequences.

In other words, the abstraction level moves upward.

The human describes intent.

The AI translates that intent into implementation.

That is enormously democratizing.

But it creates a strange possibility.

If the AI becomes the primary interface through which people learn computing, then the AI's refusal boundaries may effectively become part of their programming environment.

## When the AI becomes the gateway

Consider a student learning networking.

They learn that a service can bind to a specific local interface or to all available interfaces.

Binding to `127.0.0.1` means the service is reachable through the local loopback interface.

Binding to `0.0.0.0` generally means the service listens across the machine's available IPv4 interfaces.

There is nothing inherently malicious about the latter.

A developer may need it to test a service from another device on their own LAN.

A student may be experimenting with a virtual machine.

A developer may be testing a mobile application against a local backend.

A security learner may be building an isolated laboratory.

The meaningful question is therefore not:

> "Is exposing a service potentially dangerous?"

Of course it can be.

The better question is:

> "What system is being exposed, who owns it, what environment is being used, and what is the expected consequence?"

This distinction becomes more important as natural-language programming becomes more capable.

A traditional programmer can simply open documentation, write the socket code, compile it, and observe the result.

An AI-dependent learner may instead ask the AI to build the experiment.

If the answer is automatically:

> "I can't help with that."

the student has encountered a boundary that did not previously exist at the programming-language level.

The computer itself is still capable of performing the experiment.

The AI has become the gate.

## The ransomware laboratory example

Security education provides an even stronger example.

There is an enormous difference between ransomware intended to compromise real victims and a controlled classroom experiment designed to demonstrate the concepts involved.

A legitimate security laboratory might use:

* a disposable virtual machine;
* synthetic files;
* an isolated network;
* snapshots for rapid restoration;
* intentionally vulnerable applications;
* malware-analysis tooling;
* a sandboxed environment.

The objective may be to understand behavior, detection, recovery, or attack chains.

That is fundamentally different from deploying malicious software against unrelated systems.

The word "ransomware" alone does not completely describe the situation.

Context matters.

This does not mean an AI should automatically provide operational malware-development instructions whenever someone claims to be conducting research. Claims can be false, and the consequences of providing highly actionable capabilities can be serious.

The point is narrower:

A safety system that treats the word "ransomware" as sufficient evidence of malicious intent cannot distinguish a real attack from a controlled laboratory study.

That is a classification problem.

The challenge for future AI systems is to become better at contextual reasoning without turning "trust me, it's a lab" into a universal bypass.

## Learning computing requires breaking things

Computer science education is often described as learning how systems work.

In practice, a large portion of that learning comes from experimentation.

Build.

Observe.

Break.

Debug.

Rebuild.

A student learns networking by creating services and watching traffic.

They learn operating systems by interacting with processes, files, permissions, system calls, and resource management.

They learn web security by building applications and seeing how incorrect assumptions create vulnerabilities.

They learn malware analysis by executing samples inside controlled environments and observing behavior.

They learn programming by making mistakes and discovering why those mistakes produce unexpected results.

Safe experimentation is therefore not a peripheral part of technical education.

It is one of its foundations.

This is especially important for younger learners.

A student who has access to a virtual machine, a CTF, a localhost laboratory, synthetic data, and intentionally vulnerable applications can develop an intuitive understanding of cause and effect.

That understanding is difficult to obtain entirely from sanitized explanations.

"Never do X because X can be dangerous" teaches a rule.

Actually observing a controlled system teaches why.

## The problem with capability-only reasoning

There is a tempting security philosophy:

> If a capability can be abused, restrict the capability.

It sounds safe.

Applied consistently, however, it eventually becomes impossible.

Almost every powerful computing primitive can be abused.

File access can be abused.

Network access can be abused.

Encryption can be abused.

Process creation can be abused.

Browser automation can be abused.

Operating-system APIs can be abused.

Remote administration can be abused.

Even ordinary scripting can be abused.

If capability alone becomes the deciding factor, increasingly large portions of computing become candidates for restriction.

That produces a strange outcome.

The more powerful AI becomes at programming, the less of programming it may be allowed to explain.

The system could theoretically build almost anything, while simultaneously being instructed not to help users explore many of the primitives that make those systems possible.

That is where the "jail" metaphor becomes useful.

It is not a literal jail.

The computer is still there.

The compiler still exists.

The operating system still exposes its APIs.

The user may even own the entire environment.

But if the AI becomes the primary interface to computing, its policy boundary can become a practical boundary around what the user can easily learn and build.

## AI safety still needs stronger controls than compilers

This argument should not be mistaken for an argument that AI assistants should behave like unrestricted compilers.

They should not.

An agent can reason about an objective, generate implementation details, adapt to obstacles, invoke tools, and potentially interact with external systems.

That creates a much larger risk surface than a passive compiler.

A malicious person does not necessarily need to know every implementation detail if an agent can perform the reasoning and iteration for them.

AI systems therefore need meaningful safeguards around activities involving unauthorized targets, credential abuse, destructive actions, privacy violations, fraud, and other real-world harm.

The question is how those safeguards should be designed.

The answer should not necessarily be:

> "Block anything that has dual-use potential."

A more useful direction is graduated, context-aware control.

## Toward graduated safeguards

A future AI coding environment could conceptually distinguish several levels of activity.

### Ordinary programming

Broad assistance should be available for ordinary software engineering.

Building applications, APIs, databases, user interfaces, automation, and local development environments should generally fall into this category.

### Dual-use experimentation

When a request involves potentially risky capabilities but remains within a controlled development context, the system could shift toward contextual assistance.

The AI might explain the underlying mechanism, encourage an isolated environment, and help construct safe demonstrations rather than assuming malicious intent.

### Controlled security research

Security research in an explicitly isolated environment could receive more specialized support.

The important distinction would be the boundary of the experiment:

* owned infrastructure;
* disposable virtual machines;
* synthetic data;
* controlled networks;
* CTF environments;
* intentionally vulnerable applications.

### Real-world harmful activity

When the request clearly targets unrelated systems, real victims, stolen credentials, destructive deployment, or other meaningful harm, restrictions should become substantially stronger.

This creates a more useful distinction:

> "This capability can be abused."

versus:

> "This requested action is clearly enabling harmful abuse."

Those statements are not equivalent.

## Authorization should become a first-class concept

One of the weaknesses of keyword-based safety is that it often treats the technical noun as more important than the environment.

But cybersecurity already revolves around authorization.

The same vulnerability can be studied in:

```text
Your VM
Your CTF
Your lab network
Your intentionally vulnerable application
```

or against:

```text
Someone else's production server
Someone else's account
Someone else's private data
```

The technical concept may be identical.

The ethical and security context is not.

Future AI systems could therefore benefit from treating environment and authorization as first-class signals.

This could include explicit sandbox modes, local-only execution environments, disposable workspaces, network isolation, synthetic datasets, and human confirmation before external side effects.

Interestingly, agent frameworks are already moving toward environment and permission boundaries. OpenCode, for example, provides separate planning and build workflows, while agent systems such as Hermes expose configurable toolsets and multiple execution backends, including isolated environments.

That suggests an important alternative to simply making models refuse more things:

Control where and how powerful capabilities can execute.

## The sandbox may be better than the refusal

Suppose an AI is asked to demonstrate a dangerous concept.

There are at least three possible responses.

The first is unrestricted execution.

That may create unacceptable risk.

The second is complete refusal.

That may unnecessarily destroy legitimate educational value.

The third is controlled execution.

The AI could move the experiment into a disposable sandbox, use synthetic data, restrict network access, require confirmation for external actions, and clearly separate demonstration from deployment.

This is a more interesting security model.

Instead of:

> "You are not allowed to learn this."

the system can say:

> "You can study this capability, but the experiment must remain inside a controlled boundary."

That philosophy resembles how security laboratories already operate.

The objective is not to eliminate powerful capabilities.

It is to contain their consequences.

## Who controls the programming interface?

This eventually becomes a philosophical question.

Historically, a person who wanted to learn computing could obtain:

* a compiler;
* documentation;
* source code;
* an operating system;
* a virtual machine;
* development libraries;
* hardware;
* networking tools.

The user was responsible for deciding what to do with those capabilities, subject to ordinary laws and ethical boundaries.

If natural-language AI becomes the dominant programming interface, another actor enters the relationship:

```text
Human
  |
  v
AI programming interface
  |
  v
Compiler / runtime / operating system
  |
  v
Computer
```

The AI is now between the human and the machine.

That means its safety policy is no longer merely a property of an assistant.

It can become part of the programming environment itself.

This raises a question worth taking seriously:

> If AI becomes the way ordinary people program computers, who should decide which parts of computing they are allowed to explore?

AI companies will have enormous influence over that boundary.

Policymakers will influence it.

Schools will influence it.

Platform providers will influence it.

And eventually, society will have to decide what kind of computational freedom should remain available to individuals.

## The educational stakes are larger than they appear

The risk is not only that a professional developer gets annoyed by a refusal.

The bigger concern is what happens to the next generation of computer users.

Imagine a student who does not learn programming syntax first.

Instead, they learn systems by asking an AI:

> Build it.

Then:

> Explain why it works.

Then:

> Break it in this controlled environment.

Then:

> Show me what caused the failure.

Then:

> Fix it.

That could be an extraordinary educational model.

It could make software engineering accessible to people who previously found programming syntax intimidating.

But it only works if the learner is allowed to explore.

An AI that makes software creation dramatically easier while refusing large categories of legitimate experimentation could create an unusual contradiction:

The technology democratizes programming while restricting access to parts of the knowledge required to understand programming deeply.

The answer should not be to remove safeguards.

It should be to make the safeguards more intelligent.

## A better principle for AI safety

A useful principle might be:

> Protect people and systems from harmful actions without unnecessarily preventing people from understanding powerful computing concepts.

That requires distinguishing several things that are often collapsed together:

**Knowledge** is not the same as **capability**.

**Capability** is not the same as **intent**.

**Intent** is not the same as **execution**.

And **execution in a controlled laboratory** is not the same as **deployment against real victims**.

These distinctions become increasingly important as AI agents become more capable.

The future safety problem is therefore not simply how to stop AI from doing dangerous things.

It is also how to preserve meaningful human access to computing knowledge while preventing harmful real-world actions.

## The goal should be understandable computers, not weaker computers

There is a legitimate reason to be cautious about increasingly autonomous AI systems.

An AI that can write code is one thing.

An AI that can independently plan, execute, debug, access tools, and interact with external systems is considerably more consequential.

But stronger safeguards do not have to mean a smaller intellectual world.

The ideal future should not be:

> "AI can build everything, but users are forbidden from learning how it works."

It should be:

> "AI makes programming accessible to everyone while preserving the ability to safely explore the full capabilities of computing."

That means better sandboxing.

Better contextual reasoning.

Better authorization models.

Better separation between local experimentation and external deployment.

Better educational modes.

Better understanding of security research environments.

And fewer situations where a technically meaningful experiment is rejected merely because one of its underlying primitives can also be abused.

The history of computing is largely a history of turning powerful abstractions into accessible tools.

Programming languages did that for machine instructions.

Libraries did it for complex algorithms.

Operating systems did it for hardware.

The web did it for networked applications.

AI may do it for programming itself.

If that happens, the central safety question will change.

It will no longer be merely:

> "What can the model generate?"

It will also be:

> "What can humans safely learn and build through the model?"

And that leads to the question worth leaving open:

> **If prompting eventually becomes programming, should the safety policy of an AI assistant become the new boundary of what humans are allowed to learn about computers?**

