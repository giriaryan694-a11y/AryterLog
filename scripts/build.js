/**
 * build.js — Static page generator for AryterLog
 *
 * Reads posts-info.json + posts/*.md and generates:
 *   - posts/<id>/index.html   (fully baked static page, crawlable by Google)
 *   - sitemap.xml
 *   - robots.txt
 *
 * Run: npm install && npm run build
 * (GitHub Actions runs this automatically on every push — see
 *  .github/workflows/deploy.yml)
 */

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// ─────────────────────────────────────────────
// ⚠️  EDIT THIS to your real GitHub Pages URL
// e.g. "https://giriaryan694-a11y.github.io/AryterLog"
// (no trailing slash)
// ─────────────────────────────────────────────
const SITE_URL = "https://giriaryan694-a11y.github.io/AryterLog";

const ROOT = path.join(__dirname, "..");
const POSTS_INFO_PATH = path.join(ROOT, "posts-info.json");
const POSTS_DIR = path.join(ROOT, "posts");
const OUT_POSTS_DIR = path.join(ROOT, "posts"); // static pages live at /posts/<id>/index.html

marked.setOptions({ breaks: true, gfm: true });

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toISODate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function postPage({ post, contentHtml }) {
  const title = escapeHtml(post.title);
  const desc = escapeHtml(post.summary || "");
  const url = `${SITE_URL}/posts/${post.id}/`;
  const cats = Array.isArray(post.category) ? post.category : (post.category ? [post.category] : []);
  const catTags = cats.map(c => `<meta property="article:tag" content="${escapeHtml(c)}">`).join("\n  ");
  const catChips = cats.map(c => `<span class="card-cat-chip">${escapeHtml(c)}</span>`).join("");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: toISODate(post.date),
    author: { "@type": "Person", name: "Aryan Giri" },
    publisher: { "@type": "Organization", name: "AryterLog" },
    mainEntityOfPage: url,
    keywords: cats.join(", ")
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — AryterLog</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="AryterLog">
  <meta property="article:published_time" content="${toISODate(post.date)}">
  ${catTags}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg:#080b10; --surface:#0d1117; --surface2:#111820; --surface3:#161d27;
      --text:#d0dbe8; --text2:#7a8a9a; --accent:#00ff88; --accent2:#0ea5e9;
      --danger:#ff4560; --border:#1e2a38; --border2:#2a3848; --code-bg:#0a0f16;
      --glow:rgba(0,255,136,0.08); --glow2:rgba(0,255,136,0.18);
    }
    .light {
      --bg:#f5f7fa; --surface:#ffffff; --surface2:#f0f4f8; --surface3:#e8eef5;
      --text:#111827; --text2:#6b7280; --accent:#059669; --accent2:#0284c7;
      --danger:#dc2626; --border:#e2e8f0; --border2:#cbd5e1; --code-bg:#f1f5f9;
      --glow:rgba(5,150,105,0.07); --glow2:rgba(5,150,105,0.14);
    }
    .eye-saver {
      --bg:#12100a; --surface:#1a1608; --surface2:#211c0c; --surface3:#282210;
      --text:#e8d8b0; --text2:#9a8860; --accent:#f5c542; --accent2:#e08030;
      --danger:#e05050; --border:#302810; --border2:#3d3418; --code-bg:#0f0d06;
      --glow:rgba(245,197,66,0.08); --glow2:rgba(245,197,66,0.18);
    }

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body {
      font-family:'Fira Code',monospace;
      background:var(--bg); color:var(--text);
      min-height:100vh; overflow-x:hidden;
      transition:background 0.4s,color 0.4s;
    }
    body::before {
      content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);
      background-size:44px 44px; opacity:0.25;
    }

    header {
      position:sticky; top:0; z-index:200;
      background:rgba(8,11,16,0.86); backdrop-filter:blur(16px);
      border-bottom:1px solid var(--border);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 22px; height:56px; gap:12px;
    }
    .light header{background:rgba(245,247,250,0.9);}
    .eye-saver header{background:rgba(18,16,10,0.9);}
    header::after {
      content:''; position:absolute; bottom:-1px; left:8%; right:8%; height:1px;
      background:linear-gradient(90deg,transparent,var(--accent),transparent); opacity:0.35;
    }
    .header-left{display:flex;align-items:center;gap:12px;flex-shrink:0;}

    .logo {
      font-family:'Bebas Neue',sans-serif; font-size:24px; font-weight:400;
      letter-spacing:3px; color:var(--text); text-decoration:none; white-space:nowrap;
      flex-shrink:0; line-height:1; transition:color 0.2s;
    }
    .logo .lo-a{color:var(--accent);}
    .logo:hover .lo-a{text-shadow:0 0 14px var(--accent);}

    .back-link {
      display:inline-flex; align-items:center; gap:6px;
      background:transparent; border:1px solid var(--border2); color:var(--text2);
      padding:6px 12px; border-radius:6px; cursor:pointer; transition:all 0.2s;
      font-family:'Fira Code',monospace; font-size:11px; text-decoration:none;
    }
    .back-link:hover{border-color:var(--accent);color:var(--accent);background:var(--glow);}

    #theme-btn {
      background:transparent; border:1px solid var(--border2);
      padding:5px 11px; cursor:pointer; color:var(--text2); border-radius:6px;
      transition:all 0.2s; font-family:'Fira Code',monospace; font-size:11px;
      display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
    }
    #theme-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--glow);}
    @keyframes popSpin{0%{transform:scale(0.4) rotate(-60deg);opacity:0;}70%{transform:scale(1.15) rotate(5deg);}100%{transform:scale(1) rotate(0deg);opacity:1;}}
    .emoji{display:inline-block;}

    main{max-width:760px;margin:0 auto;padding:34px 20px 60px;position:relative;z-index:1;}

    .back-btn {
      display:inline-flex;align-items:center;gap:7px;margin-bottom:20px;
      background:var(--surface);border:1px solid var(--border2);color:var(--text2);
      padding:7px 13px;border-radius:6px;font-family:'Fira Code',monospace;font-size:11px;
      cursor:pointer;transition:all 0.2s;text-decoration:none;
    }
    .back-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--glow);}

    .post-content {
      background:var(--surface);border:1px solid var(--border);border-radius:12px;
      padding:34px 30px;position:relative;overflow:hidden;
    }
    .post-content::before {
      content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:linear-gradient(90deg,var(--accent),var(--accent2),transparent);
      border-radius:12px 12px 0 0;
    }
    .post-content *{max-width:100%;}

    h1 {
      font-family:'Space Grotesk',sans-serif;font-size:clamp(19px,4vw,26px);
      font-weight:700;color:var(--text);margin-bottom:8px;line-height:1.25;word-break:break-word;
    }
    .post-header-meta{
      font-family:'Fira Code',monospace;font-size:11px;color:var(--text2);
      padding-bottom:18px;margin-bottom:22px;border-bottom:1px solid var(--border);
      display:flex;gap:8px;flex-wrap:wrap;align-items:center;
    }
    .card-cat-chip {
      display:inline-flex;align-items:center;padding:1px 7px;border-radius:3px;
      border:1px solid var(--border2);background:var(--surface2);color:var(--text2);
      font-size:9px;font-family:'Fira Code',monospace;font-weight:500;letter-spacing:0.4px;
    }
    h2,h3{font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--text);margin:26px 0 10px;word-break:break-word;}
    h2{font-size:19px;} h3{font-size:15px;color:var(--accent);}
    p{font-size:14px;line-height:1.8;margin-bottom:14px;color:var(--text);}
    ul,ol{padding-left:20px;margin-bottom:14px;font-size:14px;line-height:1.8;}
    li{margin-bottom:4px;}

    a{color:var(--accent);word-break:break-all;overflow-wrap:break-word;transition:opacity 0.2s;}
    a:hover{opacity:0.75;}
    .post-content a{text-decoration:underline;text-underline-offset:3px;}

    code {
      background:var(--code-bg);border:1px solid var(--border);padding:2px 6px;
      border-radius:4px;font-family:'Fira Code',monospace;font-size:0.85em;
      color:var(--accent);word-break:break-all;overflow-wrap:break-word;
    }
    pre {
      background:var(--code-bg);border:1px solid var(--border);padding:18px;border-radius:8px;
      max-width:100%; overflow:hidden;
      position:relative;margin-bottom:14px;
    }
    pre::before{
      content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:linear-gradient(90deg,var(--accent),var(--accent2),transparent);
      opacity:0.5;border-radius:8px 8px 0 0;
    }
    pre code{
      background:transparent;border:none;padding:0 60px 0 0;word-break:normal;
      overflow-wrap:normal;white-space:pre;display:block;
      overflow-x:auto;-webkit-overflow-scrolling:touch;
      font-size:13px;line-height:1.65;color:var(--text);
    }
    blockquote{
      border-left:2px solid var(--accent);margin:14px 0;padding:10px 16px;
      background:var(--glow);border-radius:0 6px 6px 0;font-style:italic;color:var(--text2);
    }
    table{width:100%;border-collapse:collapse;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;font-size:13px;margin-bottom:14px;}
    th,td{border:1px solid var(--border);padding:8px 12px;text-align:left;white-space:nowrap;}
    th{background:var(--surface2);color:var(--accent);font-weight:600;}
    img{max-width:100%;height:auto;border-radius:8px;display:block;margin:14px 0;}

    .copy-btn {
      position:absolute;top:9px;right:9px;padding:3px 8px;font-size:10px;
      font-family:'Fira Code',monospace;font-weight:500;background:var(--surface2);
      border:1px solid var(--border2);color:var(--text2);border-radius:4px;cursor:pointer;
      transition:all 0.2s;opacity:0;letter-spacing:0.3px;
    }
    pre:hover .copy-btn{opacity:1;}
    .copy-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--glow);}
    .copy-btn.copied{border-color:var(--accent);color:var(--accent);opacity:1;}

    footer{
      text-align:center;padding:22px 16px;color:var(--text2);
      font-family:'Fira Code',monospace;font-size:11px;
      border-top:1px solid var(--border);position:relative;z-index:1;
    }
    .f-accent{color:var(--accent);}
    footer a{color:var(--accent);text-decoration:none;}
    footer a:hover{opacity:0.75;}

    @media(max-width:480px){
      header{padding:0 13px;height:50px;}
      .logo{font-size:21px;letter-spacing:2px;}
      main{padding:20px 14px 44px;}
      .post-content{padding:20px 14px;}
      pre{padding:13px;}
    }
  </style>
</head>
<body>
  <header>
    <div class="header-left">
      <a href="../../index.html" class="logo">Aryter<span class="lo-a">Log</span></a>
    </div>
    <button id="theme-btn" aria-label="Cycle Theme">
      <span class="emoji" id="theme-emoji">🌙</span>
      <span id="theme-label">Dark</span>
    </button>
  </header>

  <main>
    <a href="../../index.html#post-${post.id}" class="back-btn">← Back to Blog</a>
    <article class="post-content">
      <h1>${title}</h1>
      <div class="post-header-meta">
        <span>📅 Published ${escapeHtml(post.date)}</span>
        ${catChips ? `<span>·</span>${catChips}` : ""}
      </div>
      ${contentHtml}
    </article>
  </main>

  <footer>
    <span class="f-accent">$</span> echo "Made by <span class="f-accent">Aryan Giri</span>" &nbsp;·&nbsp; <a href="https://github.com/giriaryan694-a11y" target="_blank" rel="noopener noreferrer">GitHub</a>
  </footer>

  <script>
    /* Theme — synced with main site via same cookie */
    const themes=["dark","light","eye-saver"];
    const themeData={"dark":{emoji:"🌙",label:"Dark"},"light":{emoji:"☀️",label:"Light"},"eye-saver":{emoji:"☕",label:"Reading"}};
    function setCookie(n,v,d){const e=new Date();e.setTime(e.getTime()+d*86400000);document.cookie=\`\${n}=\${v};expires=\${e.toUTCString()};path=/\`;}
    function getCookie(n){const m=document.cookie.match(new RegExp('(^| )'+n+'=([^;]+)'));return m?m[2]:null;}
    let currentTheme=getCookie("site_theme")||"dark";
    const themeBtn=document.getElementById("theme-btn");
    const themeEmoji=document.getElementById("theme-emoji");
    function applyTheme(theme,animate=false){
      document.body.className=theme==="dark"?"":theme;
      themeEmoji.textContent=themeData[theme].emoji;
      document.getElementById("theme-label").textContent=themeData[theme].label;
      setCookie("site_theme",theme,365);
      if(animate){themeEmoji.style.animation="none";themeEmoji.offsetHeight;themeEmoji.style.animation="popSpin 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards";}
    }
    applyTheme(currentTheme);
    themeBtn.addEventListener("click",()=>{currentTheme=themes[(themes.indexOf(currentTheme)+1)%themes.length];applyTheme(currentTheme,true);});

    /* Links → new tab + copy buttons on code blocks */
    document.querySelectorAll(".post-content a").forEach(l => {
      l.setAttribute("target", "_blank");
      l.setAttribute("rel", "noopener noreferrer");
    });
    document.querySelectorAll("pre").forEach(pre => {
      const code = pre.querySelector("code");
      if (!code) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.onclick = async () => {
        try { await navigator.clipboard.writeText(code.innerText.trimEnd()); }
        catch {}
        btn.textContent = "✓ copied"; btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("copied"); }, 2000);
      };
      pre.appendChild(btn);
    });
  </script>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(POSTS_INFO_PATH)) {
    console.error("❌ posts-info.json not found at repo root.");
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_INFO_PATH, "utf-8"));
  const sitemapEntries = [
    { loc: `${SITE_URL}/`, lastmod: new Date().toISOString() }
  ];

  posts.forEach(post => {
    const filePath = post.file || post.file_path;
    if (!filePath) {
      console.warn(`⚠️  Skipping "${post.id}" — no "file" field.`);
      return;
    }

    const mdAbsPath = path.join(ROOT, filePath);
    if (!fs.existsSync(mdAbsPath)) {
      console.warn(`⚠️  Skipping "${post.id}" — markdown file not found at ${filePath}`);
      return;
    }

    const md = fs.readFileSync(mdAbsPath, "utf-8");
    const contentHtml = marked.parse(md);

    const outDir = path.join(OUT_POSTS_DIR, post.id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), postPage({ post, contentHtml }), "utf-8");

    sitemapEntries.push({
      loc: `${SITE_URL}/posts/${post.id}/`,
      lastmod: toISODate(post.date)
    });

    console.log(`✅ Built posts/${post.id}/index.html`);
  });

  // Also index the web resources page if it exists
  if (fs.existsSync(path.join(ROOT, "web", "index.html"))) {
    sitemapEntries.push({ loc: `${SITE_URL}/web/`, lastmod: new Date().toISOString() });
  }

  // ── sitemap.xml ──
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod.split("T")[0]}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapXml, "utf-8");
  console.log("✅ Built sitemap.xml");

  // ── robots.txt ──
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsTxt, "utf-8");
  console.log("✅ Built robots.txt");

  console.log(`\n🎉 Done. Generated ${sitemapEntries.length - 1} post page(s).`);
}

main();
