Written By Aryan Giri

CNAME and NS records are foundational DNS signals used in reconnaissance to reconstruct infrastructure topology, identify external dependencies, and map DNS authority boundaries. When analyzed correctly, they enable full attack surface expansion without interacting directly with application logic.

## CNAME in Recon (Alias Resolution Layer)

CNAME (Canonical Name) records define aliasing behavior in DNS. Instead of hosting services directly, a domain delegates resolution to another hostname. This creates a chain of indirection that often leaks cloud providers, SaaS integrations, and backend architecture patterns.

### Example

```
app.target.com → target.azurewebsites.net
```

This indicates the application is hosted on Azure App Services rather than internal infrastructure.

## Practical CNAME Enumeration

### Using dig

```
dig CNAME app.target.com
```

### Clean output extraction

```
dig +short CNAME app.target.com
```

### Using nslookup

```
nslookup -type=CNAME app.target.com
```

### Recursive resolution chain

```
dig app.target.com +noall +answer +additional
```

## Offensive Value of CNAME

### 1. Cloud footprint discovery

CNAME records often reveal infrastructure usage patterns:

* AWS CloudFront
* Azure Web Apps
* Google Cloud Storage
* Heroku / Vercel / GitHub Pages

This expands reconnaissance scope beyond the parent domain into external provider infrastructure.

### 2. Subdomain takeover detection

A CNAME pointing to an unclaimed external resource indicates takeover potential.

Example:

```
old-api.target.com → unused-heroku-app.herokuapp.com
```

If the external resource is unclaimed, the attacker can register it and control the subdomain.

### 3. Backend exposure mapping

CNAME chains often reveal internal naming conventions:

* api-prod
* internal-services
* s3 buckets
* load balancer endpoints

This helps reconstruct backend architecture.

## NS Records in Recon (DNS Authority Layer)

NS (Name Server) records define authoritative DNS providers responsible for resolving domain queries. Unlike CNAME, NS operates at the control plane level.

### Example

```
target.com → ns1.cloudflare.com
```

This indicates Cloudflare manages DNS resolution for the domain.

## Practical NS Enumeration

### Query NS records

```
dig NS target.com
```

### Short output

```
dig +short NS target.com
```

### Trace full resolution path

```
dig target.com +trace
```

## Offensive Value of NS

### 1. DNS provider identification

NS records expose infrastructure dependencies:

* Cloudflare
* AWS Route53
* Google DNS
* Akamai

Each provider has different security boundaries and misconfiguration risks.

### 2. Zone transfer assessment

If misconfigured BIND servers exist, NS discovery enables AXFR attempts:

```
dig AXFR target.com @ns1.target.com
```

A successful zone transfer exposes full internal DNS mapping.

### 3. Organizational segmentation

Multiple NS patterns often indicate environment separation:

* dev.target.com → separate DNS zone
* prod.target.com → production zone

This can reveal weak segmentation or inconsistent DNS governance.

## Combined Recon Model (CNAME + NS)

CNAME defines what services exist. NS defines who controls resolution.

### Recon workflow example

```
subdomain enumeration → CNAME resolution → cloud endpoint identification → NS provider mapping
```

### Practical chained execution

```
dig sub.target.com CNAME

dig target.com NS

dig +short sub.target.com
```

## Offensive Recon Pipeline

### Step 1: Subdomain enumeration

Tools like subfinder, assetfinder, or amass generate initial scope.

### Step 2: CNAME resolution

Resolve all discovered subdomains to identify cloud and SaaS infrastructure.

### Step 3: NS analysis

Identify DNS provider, detect misconfigurations, and map authority boundaries.

### Step 4: Pivot opportunities

* orphaned cloud resources
* subdomain takeover vectors
* misconfigured DNS zones
* hidden backend services

## Key Insight

DNS is not just name resolution. It encodes infrastructure design decisions.

* CNAME exposes service delegation and backend exposure
* NS exposes administrative control and DNS authority

Together they form a complete model for reconstructing external infrastructure without active exploitation traffic.
