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


const SITE_URL = "https://giriaryan694-a11y.github.io/AryterLog/";

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
    :root{--bg:#080b10;--surface:#0d1117;--surface2:#111820;--text:#d0dbe8;--text2:#7a8a9a;--accent:#00ff88;--accent2:#0ea5e9;--border:#1e2a38;--border2:#2a3848;--code-bg:#0a0f16;--glow:rgba(0,255,136,0.08);}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Fira Code',monospace;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.7;}
    body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:44px 44px;opacity:0.25;}
    header{position:sticky;top:0;z-index:200;background:rgba(8,11,16,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 22px;height:56px;}
    .logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:3px;color:var(--text);text-decoration:none;}
    .logo .lo-a{color:var(--accent);}
    .back-link{margin-left:auto;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border2);color:var(--text2);padding:6px 12px;border-radius:6px;text-decoration:none;font-size:11px;transition:all .2s;}
    .back-link:hover{border-color:var(--accent);color:var(--accent);background:var(--glow);}
    main{max-width:760px;margin:0 auto;padding:34px 20px 60px;position:relative;z-index:1;}
    .post-content{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:34px 30px;position:relative;overflow:hidden;}
    .post-content::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2),transparent);}
    .post-content *{max-width:100%;}
    h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(20px,4vw,28px);font-weight:700;margin-bottom:8px;line-height:1.25;}
    .post-header-meta{font-size:11px;color:var(--text2);padding-bottom:18px;margin-bottom:22px;border-bottom:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
    .card-cat-chip{display:inline-flex;padding:1px 7px;border-radius:3px;border:1px solid var(--border2);background:var(--surface2);color:var(--text2);font-size:9px;}
    h2,h3{font-family:'Space Grotesk',sans-serif;font-weight:600;margin:26px 0 10px;}
    h2{font-size:19px;} h3{font-size:15px;color:var(--accent);}
    p{font-size:14px;margin-bottom:14px;}
    ul,ol{padding-left:20px;margin-bottom:14px;font-size:14px;}
    li{margin-bottom:4px;}
    a{color:var(--accent);word-break:break-all;text-decoration:underline;text-underline-offset:3px;}
    code{background:var(--code-bg);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:0.85em;color:var(--accent);word-break:break-all;}
    pre{background:var(--code-bg);border:1px solid var(--border);padding:18px;border-radius:8px;overflow:hidden;position:relative;margin-bottom:14px;}
    pre code{background:transparent;border:none;padding:0 60px 0 0;word-break:normal;white-space:pre;display:block;overflow-x:auto;font-size:13px;color:var(--text);}
    blockquote{border-left:2px solid var(--accent);margin:14px 0;padding:10px 16px;background:var(--glow);border-radius:0 6px 6px 0;font-style:italic;color:var(--text2);}
    table{width:100%;border-collapse:collapse;display:block;overflow-x:auto;font-size:13px;margin-bottom:14px;}
    th,td{border:1px solid var(--border);padding:8px 12px;text-align:left;white-space:nowrap;}
    th{background:var(--surface2);color:var(--accent);}
    img{max-width:100%;border-radius:8px;display:block;margin:14px 0;}
    .copy-btn{position:absolute;top:9px;right:9px;padding:3px 8px;font-size:10px;background:var(--surface2);border:1px solid var(--border2);color:var(--text2);border-radius:4px;cursor:pointer;font-family:'Fira Code',monospace;}
    .copy-btn:hover{border-color:var(--accent);color:var(--accent);}
    .copy-btn.copied{border-color:var(--accent);color:var(--accent);}
    footer{text-align:center;padding:22px 16px;color:var(--text2);font-size:11px;border-top:1px solid var(--border);position:relative;z-index:1;}
    footer a{color:var(--accent);text-decoration:none;}
  </style>
</head>
<body>
  <header>
    <a href="../../index.html" class="logo">Aryter<span class="lo-a">Log</span></a>
    <a href="../../index.html#post-${post.id}" class="back-link">← Back to Blog</a>
  </header>

  <main>
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
    $ echo "Made by Aryan Giri" · <a href="https://github.com/giriaryan694-a11y" target="_blank" rel="noopener noreferrer">GitHub</a>
  </footer>

  <script>
    // Open all in-post links in new tab + add copy buttons to code blocks
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
