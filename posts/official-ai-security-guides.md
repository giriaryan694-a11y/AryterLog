**Written by Aryan Giri**

AI systems are no longer just chatbots. They now include retrieval pipelines, tools, memory, agents, plugins, model gateways, and cloud integrations. That means the security review is bigger than classic web pentesting. You need guidance for prompt injection, data leakage, model abuse, supply-chain risk, unsafe tool use, and weak operational controls.

This article collects the most useful official references for testing and securing AI systems. Each one covers a different layer of the stack, so together they form a solid baseline for red teaming, secure design, and risk management.

## 1) OWASP GenAI Red Teaming Guide

**URL:** [https://genai.owasp.org/resource/genai-red-teaming-guide/](https://genai.owasp.org/resource/genai-red-teaming-guide/)

This guide is built for people who want to test GenAI systems like an attacker would. It helps you think about abuse paths across the model, the application, the infrastructure, and the runtime environment. It is useful when you need a practical testing mindset instead of only policy-level advice.

**What it does for AI security:**

* Helps identify prompt injection and jailbreak paths
* Supports testing for data leakage and unsafe output behavior
* Gives structure to red-team exercises for GenAI apps
* Helps security teams move from theory to hands-on validation

## 2) OWASP AI Testing Guide

**URL:** [https://owasp.org/www-project-ai-testing-guide/](https://owasp.org/www-project-ai-testing-guide/)

This is OWASP’s testing-focused guide for AI systems. It is meant to help assess whether an AI system is behaving safely, reliably, and securely under realistic conditions. It is especially useful when you want a repeatable testing workflow.

**What it does for AI security:**

* Gives a structured way to test AI behavior and implementation
* Helps map test cases to trust, safety, and security goals
* Useful for pre-deployment validation and regression testing
* Helps teams standardize AI security checks

## 3) OWASP Top 10 for Large Language Model Applications (2025)

**URL:** [https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/)

This is one of the clearest checklists for LLM application risk. It captures the main categories people run into when deploying LLM apps in the real world. If you are testing a chatbot, agent, or RAG app, this is one of the first documents to read.

**What it does for AI security:**

* Highlights the most common LLM app vulnerabilities
* Helps prioritize the highest-risk attack classes
* Useful for scoping assessments and building test plans
* Works well as a pentest checklist for AI apps

## 4) OWASP AI Agent Security Cheat Sheet

**URL:** [https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

Agentic AI is different from a normal chatbot because it can plan, call tools, remember context, and take actions. That creates a much bigger attack surface. This cheat sheet focuses on the security of those agent behaviors.

**What it does for AI security:**

* Helps secure tool use and action execution
* Covers memory, state, and agent behavior risks
* Useful for systems that can browse, email, write files, or trigger workflows
* Helps reduce the risk of autonomous misuse

## 5) OWASP Agentic AI Threats and Mitigations

**URL:** [https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

This document looks at the threat side of agentic AI in more detail. It is useful when you need to understand what can go wrong when an AI system has access to tools, APIs, plugins, or external services.

**What it does for AI security:**

* Describes attack paths unique to agentic systems
* Helps model abuse of planning, tool calls, and memory
* Supports threat modeling for complex AI workflows
* Good for identifying control gaps before deployment

## 6) MITRE ATLAS

**URL:** [https://atlas.mitre.org/](https://atlas.mitre.org/)

MITRE ATLAS is the AI equivalent of a threat technique knowledge base. It maps adversarial behaviors against AI systems into a structured knowledge base. It is one of the best references for understanding how AI gets attacked in practice.

**What it does for AI security:**

* Provides a taxonomy of adversarial AI tactics and techniques
* Helps teams build threat models using common attacker patterns
* Useful for red-team planning and detection engineering
* Strong reference for mapping controls to attack techniques

## 7) OWASP AI Security & Privacy Guide

**URL:** [https://owasp.org/www-project-ai-security-and-privacy-guide/](https://owasp.org/www-project-ai-security-and-privacy-guide/)

This guide goes broader than testing alone. It covers how to design, build, deploy, and govern AI systems while keeping security and privacy in mind. It is helpful for engineering teams that want secure defaults from the start.

**What it does for AI security:**

* Supports secure architecture decisions
* Covers privacy, data handling, and lifecycle risks
* Helps teams build controls into the design phase
* Useful for policy, engineering, and review workflows

## 8) NIST AI Risk Management Framework (AI RMF 1.0)

**URL:** [https://www.nist.gov/itl/ai-risk-management-framework](https://www.nist.gov/itl/ai-risk-management-framework)

NIST AI RMF is the main official framework for managing AI risk. It is not a pentest guide, but it is one of the best references for building a mature AI security program. It helps organizations understand, measure, govern, and manage AI risk across the lifecycle.

**What it does for AI security:**

* Gives a lifecycle view of AI risk
* Helps align technical controls with governance
* Useful for security programs, not just individual assessments
* Strong foundation for policy and risk management

## 9) NIST AI RMF Generative AI Profile (NIST AI 600-1)

**URL:** [https://www.nist.gov/itl/ai-risk-management-framework](https://www.nist.gov/itl/ai-risk-management-framework)

This profile extends the NIST AI RMF with generative AI in mind. It is especially relevant when your system uses large language models, agents, or other generative components.

**What it does for AI security:**

* Adds GenAI-specific risk thinking
* Helps map controls to realistic GenAI deployments
* Useful for organizations adopting LLM apps at scale
* Strong fit for governance and assurance work

## 10) NIST AI RMF Playbook

**URL:** [https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook)

The playbook is the practical companion to the AI RMF. It turns high-level ideas into action-oriented guidance. For teams building AI security programs, this is the bridge from framework to implementation.

**What it does for AI security:**

* Helps translate framework goals into tasks
* Useful for program planning and control mapping
* Supports operationalizing AI governance
* Good for security teams building repeatable processes

## 11) NIST Secure Software Development Practices for Generative AI and Dual-Use Foundation Models

**URL:** [https://www.nist.gov/publications/secure-software-development-practices-generative-ai-and-dual-use-foundation-models-ssdf](https://www.nist.gov/publications/secure-software-development-practices-generative-ai-and-dual-use-foundation-models-ssdf)

This document connects secure development thinking with GenAI and foundation models. It is useful when you need to secure the software lifecycle around AI, not just the model itself.

**What it does for AI security:**

* Connects secure development practices to AI systems
* Helps address software supply-chain and build pipeline risk
* Useful for engineering and DevSecOps teams
* Good reference for secure implementation standards

## 12) UK NCSC: Guidelines for Secure AI System Development

**URL:** [https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development)

This is one of the clearest official secure-design references for AI. It focuses on how to develop AI systems securely from the beginning, covering the main stages from design through deployment and operation.

**What it does for AI security:**

* Helps teams design secure AI systems from the start
* Gives practical advice across the development lifecycle
* Useful for engineering teams and architects
* Strong source for secure-by-design AI work

## 13) ENISA: Cybersecurity of AI and Standardisation

**URL:** [https://www.enisa.europa.eu/publications/cybersecurity-of-ai-and-standardisation](https://www.enisa.europa.eu/publications/cybersecurity-of-ai-and-standardisation)

ENISA’s work is useful when you want to understand the standards and security gaps around AI. It is more strategic than hands-on pentesting guidance, but it helps connect AI security to policy and standards.

**What it does for AI security:**

* Shows where AI security standards are heading
* Helps teams understand maturity and standardization gaps
* Useful for compliance and procurement discussions
* Good for broader governance context

## 14) ENISA: Securing Machine Learning Algorithms

**URL:** [https://www.enisa.europa.eu/publications/securing-machine-learning-algorithms](https://www.enisa.europa.eu/publications/securing-machine-learning-algorithms)

This report focuses on machine learning security threats rather than just LLM apps. It is useful when the system includes classical ML, training pipelines, or data-driven decision systems.

**What it does for AI security:**

* Covers ML-specific threats like poisoning and adversarial inputs
* Useful for data pipeline and model training security
* Helps teams understand traditional ML attack surfaces
* Strong reference for ML-heavy environments

## 15) CSA AI Controls Matrix (AICM)

**URL:** [https://cloudsecurityalliance.org/artifacts/ai-controls-matrix](https://cloudsecurityalliance.org/artifacts/ai-controls-matrix)

The CSA AI Controls Matrix is a control framework for AI systems. It is helpful when you need to map security, privacy, and governance requirements into a structured control set.

**What it does for AI security:**

* Provides a control-oriented view of AI security
* Helpful for audits, procurement, and assurance
* Can be mapped to other standards and frameworks
* Useful for enterprise AI governance programs

## 16) CSA AI Core Security Responsibilities

**URL:** [https://cloudsecurityalliance.org/artifacts/ai-organizational-responsibilities-core-security-responsibilities](https://cloudsecurityalliance.org/artifacts/ai-organizational-responsibilities-core-security-responsibilities)

This guide focuses on who is responsible for what in AI security. It is useful when teams are trying to avoid gaps between model owners, app owners, cloud teams, and security teams.

**What it does for AI security:**

* Clarifies accountability across AI operations
* Helps organize controls by responsibility
* Useful for governance and operational security
* Good for reducing “everyone thought someone else handled it” risk

## 17) CSA STAR for AI

**URL:** [https://cloudsecurityalliance.org/star/ai](https://cloudsecurityalliance.org/star/ai)

CSA STAR for AI is aimed at assurance and trust. It is useful when organizations want a higher-level way to show that AI systems are being governed responsibly.

**What it does for AI security:**

* Supports assurance and trust claims
* Useful for vendor review and procurement
* Helps organizations communicate AI risk posture
* Good for compliance-oriented programs

## Best way to use these together

If you are building a real workflow, use them in layers:

Start with **MITRE ATLAS** and **OWASP Top 10 for LLM Applications** to understand attacker behavior and common risks. Then use the **OWASP GenAI Red Teaming Guide** and **OWASP AI Testing Guide** to build your test plan. For secure architecture, lean on **OWASP AI Security & Privacy Guide**, **UK NCSC secure AI development guidance**, and **NIST AI RMF**. For control mapping and governance, use **CSA AICM** and the NIST/ENISA references.

## Bottom line

For AI pentesting, the strongest starting trio is:

* **OWASP GenAI Red Teaming Guide**
* **MITRE ATLAS**
* **OWASP Top 10 for LLM Applications**

For secure design, the strongest starting trio is:

* **NIST AI RMF**
* **UK NCSC Secure AI System Development**
* **OWASP AI Security & Privacy Guide**

Together, these give you both the attacker's view and the defender's blueprint.
