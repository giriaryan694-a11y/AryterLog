**Written by Aryan Giri**

---

## 1. Introduction

Python serialization is convenient, but it becomes dangerous the moment untrusted model files enter the workflow. `pickle` can carry execution behavior during deserialization, which is why pickle-based ML artifacts are a classic supply-chain risk.

This article covers:

* `pickletools` for disassembling pickle bytecode
* `Fickling` for decompiling and analyzing pickle files
* `h5py` / HDF5 as a second model-file surface
* `ModelScan` for scanning model artifacts before loading them

---

## 2. What Pickling Does

Pickling converts Python objects into a byte stream. Unpickling restores them later.

```python
import pickle

obj = {"user": "aryan", "role": "analyst"}
blob = pickle.dumps(obj)
restored = pickle.loads(blob)
print(restored)
```

The risk is simple: loading a malicious pickle can trigger code execution during deserialization.

---

## 3. Why Pickle is Dangerous

`pickle` is not just data storage. It can reference functions and reconstruct objects through execution-like behavior.

Common abuse paths include:

* `__reduce__` abuse
* malicious opcode chains
* hidden imports
* payloads embedded in model files

```python
import pickle
import os

class Evil:
    def __reduce__(self):
        return (os.system, ("whoami",))

payload = pickle.dumps(Evil())
# Never load untrusted pickle data.
```

---

## 4. pickletools: Disassemble the Bytecode

`pickletools` is the first lens for inspecting a suspicious pickle file. It disassembles pickle bytecode without executing it.

### CLI usage

```bash
python -m pickletools model.pkl
```

### Useful examples

```bash
python -m pickletools suspicious.pkl > disassembly.txt
python -m pickletools model.pkl | less
```

### Why it matters

It lets you inspect opcodes such as `GLOBAL`, `REDUCE`, and `BUILD` so you can understand how the object will be reconstructed.

---

## 5. Fickling: Decompiler and Static Analyzer

`Fickling` goes deeper than raw opcode dumps. It is a decompiler, static analyzer, and bytecode rewriter for Python pickle serializations.

### Install

```bash
python -m pip install fickling
```

### CLI examples

```bash
fickling --help
fickling --trace model.pkl
fickling --check-safety -p model.pkl
```

### What it is good for

* tracing pickle execution safely
* checking whether a file looks malicious
* decompiling pickle logic into a more readable form

### Programmatic check example

```python
import fickling

if not fickling.is_likely_safe("model.pkl"):
    print("Unsafe file")
```

---

## 6. h5py and HDF5: The Other Model Format You Should Know

The common Python library for HDF5 is `h5py`. It is a Pythonic interface to the HDF5 binary data format.

### Install

```bash
python -m pip install h5py
```

### Tiny example

```python
import h5py

with h5py.File("model.h5", "r") as f:
    print(list(f.keys()))
```

HDF5 files are common in ML workflows, so they belong in any model-file review workflow.

---

## 7. ModelScan: Scan the Artifact Before Loading It

`ModelScan` is built to scan model files for unsafe code patterns across multiple formats, including Pickle and H5.

### Install

```bash
python -m pip install modelscan
```

### Basic scan

```bash
modelscan -p model.pkl
```

### More examples

```bash
modelscan -p suspicious.pkl
modelscan -p model.h5
modelscan -h
modelscan -v
```

### Create a settings file

```bash
modelscan create-settings-file
```

### Why it matters

It gives you a fast static scan before a model ever reaches `pickle.load()`, `torch.load()`, or similar loaders.

---

## 8. A Practical Triage Flow

1. Identify the file type.
2. Run `pickletools` if it is a pickle artifact.
3. Run `Fickling` for deeper inspection.
4. Run `ModelScan` across the file.
5. Only then decide whether the artifact is safe to load in a sandbox.

### Example triage session

```bash
file model.pkl
python -m pickletools model.pkl > disassembly.txt
fickling --check-safety -p model.pkl
modelscan -p model.pkl
```

---

## 9. Key Takeaways

* `pickletools` helps you inspect pickle bytecode safely.
* `Fickling` adds decompilation, tracing, and safety checks.
* `h5py` matters because HDF5 model files are also a real attack surface.
* `ModelScan` gives you a fast static scan across model formats.

---
