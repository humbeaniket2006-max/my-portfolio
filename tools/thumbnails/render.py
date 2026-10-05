"""Render every project tile through frame.html -> assets/work/<slug>.webp (1440x1080) and <slug>-720.webp.
Run: python3 tools/thumbnails/render.py [slug ...]
Source material lives in assets/source/. Crops are cached in tools/thumbnails/cache/."""
import os, sys, io, http.server, threading, functools
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(ROOT, "assets", "source")
OUT = os.path.join(ROOT, "assets", "work")
CACHE = os.path.join(HERE, "cache")
os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)

def crop(name, src, box):
    p = os.path.join(CACHE, name + ".png")
    Image.open(os.path.join(SRC, src)).convert("RGB").crop(box).save(p)
    return f"tools/thumbnails/cache/{name}.png"

def cover(path, pos="50% 50%"):
    return f'<img class="cover" src="/{path}" style="object-position:{pos}" alt="">'

def typo(num, title, tags, big=None, bigsmall=None, size=176):
    mid = f'<div><div class="big"><span style="font-size:{size}px;white-space:nowrap">{big}</span></div><div style="font-size:40px;margin-top:20px;color:var(--muted)">{bigsmall}</div></div>' if big else f'<h3>{title}</h3>'
    head = f'<h3 style="font-size:64px;color:var(--muted)">{title}</h3>' if big else ''
    t = "".join(f"<span>{x}</span>" for x in tags)
    return f'<div class="type"><div><div class="num">{num}</div>{head}</div>{mid}<div><div class="rule"></div><div class="tags">{t}</div></div></div>'

def tile_ocular():
    bar = '''<svg viewBox="0 0 688 508" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<rect width="688" height="508" fill="#FAF8F4"/>
<text x="40" y="64" font-size="20" fill="#5F5B54">CPU inference speed, Intel, relative</text>
<line x1="40" y1="440" x2="648" y2="440" stroke="#1A1A1A" stroke-width="2"/>
<rect x="110" y="340" width="150" height="100" fill="none" stroke="#1A1A1A" stroke-width="2"/>
<rect x="410" y="140" width="150" height="300" fill="#23406B"/>
<text x="185" y="324" font-size="30" text-anchor="middle" fill="#1A1A1A">1x</text>
<text x="485" y="124" font-size="48" text-anchor="middle" fill="#23406B">3x</text>
<text x="185" y="476" font-size="19" text-anchor="middle" fill="#5F5B54">PyTorch</text>
<text x="485" y="476" font-size="19" text-anchor="middle" fill="#5F5B54">OpenVINO FP16</text>
</svg>'''
    imgs = [("ocular-baseline-lite.png", "baseline_lite"), ("ocular-normal-map.png", "normal_map"), ("ocular-stress-test.png", "stress_test")]
    cells = "".join(f'<div><img src="/assets/source/{f}" alt=""><span class="cap">{c}</span></div>' for f, c in imgs)
    return f'<div class="grid4">{cells}<div>{bar}</div></div>'

def tile_capi():
    return '''<svg viewBox="0 0 1374 1014" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<rect width="1374" height="1014" fill="#FAF8F4"/>
<g fill="none" stroke="#1A1A1A" stroke-width="2.5">
<rect x="60" y="140" width="300" height="150" rx="6"/>
<rect x="537" y="140" width="300" height="150" rx="6" stroke="#23406B" stroke-width="4"/>
<rect x="1014" y="140" width="300" height="150" rx="6"/>
<rect x="537" y="620" width="300" height="150" rx="6"/>
<rect x="60" y="620" width="300" height="150" rx="6"/>
<path d="M360 215H537M837 215H1014M687 290V620M537 695H360"/>
<path d="M527 205l10 10-10 10M1004 205l10 10-10 10M677 610l10 10 10-10M370 685l-10 10 10 10" />
</g>
<g font-size="26" fill="#1A1A1A" text-anchor="middle">
<text x="210" y="205">Meta Lead Ads</text><text x="210" y="245" fill="#5F5B54" font-size="20">lead form webhook</text>
<text x="687" y="205">FastAPI service</text><text x="687" y="245" fill="#23406B" font-size="20">Render</text>
<text x="1164" y="205">Freshsales</text><text x="1164" y="245" fill="#5F5B54" font-size="20">contact + deal</text>
<text x="687" y="685">Postgres</text><text x="687" y="725" fill="#5F5B54" font-size="20">dedupe, dead letters</text>
<text x="210" y="685">Meta CAPI</text><text x="210" y="725" fill="#5F5B54" font-size="20">conversion events</text>
</g>
<g font-size="18" fill="#5F5B54" text-anchor="middle"><text x="448" y="196">1 lead</text><text x="925" y="196">2 create</text><text x="743" y="470">3 state</text><text x="448" y="676">4 event</text></g>
<text x="60" y="880" font-size="20" fill="#5F5B54">Data flow. No client data shown.</text>
</svg>'''

def tile_surya():
    return '''<svg viewBox="0 0 1374 1014" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<rect width="1374" height="1014" fill="#FAF8F4"/>
<g fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M330 640L480 280H1060L1210 640Z"/>
<path d="M405 460H1135M370 550H1170M555 280L480 640M770 280V640M985 280L1060 640"/>
<path d="M270 700H1270M600 700V860M770 700V860M940 700V860"/>
<circle cx="1210" cy="230" r="50"/>
<path d="M1210 150V120M1290 230H1320M1267 173l22-22"/>
<rect x="500" y="860" width="500" height="64" rx="4"/>
</g>
<g font-size="22" fill="#5F5B54">
<text x="800" y="365">panel</text><text x="1060" y="120" fill="#1A1A1A" text-anchor="end">dust sensor</text><text x="1010" y="905">cleaning actuator</text><text x="1010" y="940" fill="#5F5B54" font-size="18">dust costs panels 15-25% output</text>
</g>
</svg>'''

def build_tiles():
    cy = crop("cyber", "cybershield-home.png", (922, 202, 1958, 936))
    eh = crop("ehmr", "carecore-dashboard.png", (564, 130, 2250, 1395))
    br = crop("brand", "brand-ad-analyzer.png", (1400, 320, 2840, 1240))
    ms = crop("msme", "msme-index.png", (100, 120, 2260, 1740))
    jc = crop("jcas", "jcas-ai.png", (340, 280, 2540, 1560))
    px = crop("pouch", "inhaus-creator-fuel.jpg", (250, 40, 1080, 1160))
    return {
        "ocular-core-lite": tile_ocular(),
        "aeo-geo-sales-agent": typo("02", "AEO/GEO Sales Agent", ["Streamlit", "Groq", "7 stages"], big='<span style="font-size:176px;white-space:nowrap">4h → &lt;10 min</span>', bigsmall="prospect research, per prospect"),
        "carecore": cover(eh, "0% 0%"),
        "meta-capi-crm": tile_capi(),
        "brand-ad-video-analyzer": cover(br),
        "msme-data-index": cover(ms, "0% 0%"),
        "ooho-build-vs-buy": typo("07", "OOHO build vs buy", ["Excel", "Vendor quotes", "5-year model"], big="Rs. 23.54L", bigsmall="in-house, 5 years"),
        "inhaus-coffee": f'<img class="cover" src="/assets/source/inhaus-creator-fuel.jpg" style="object-fit:contain;background:#e0d2c7" alt="">',
        "suryagrid": tile_surya(),
        "jcas-ai": cover(jc, "0% 0%"),
        "cybershield": cover(cy, "50% 0%"),
        "shopsense-ar": '<img class="cover" src="/assets/source/shopsense-lens-studio.jpg" style="object-position:50% 50%" alt="">',
        "business-strategy-analyser": typo("12", "Business Strategy Analyser", ["Claude API", "SWOT", "Five Forces"]),
        "mixpanel-implementation": typo("14", "Mixpanel Implementation", ["Mixpanel", "UTM", "Freshsales"], big="34 events", bigsmall="across 7 funnels"),
        "weekly-crm-ads-report": typo("15", "Weekly CRM/Ads Report", ["Claude", "MCP", "GitHub Actions"], big="2 MCP servers", bigsmall="reconciled every week", size=150),
        "seo-aeo-geo-schema": typo("16", "SEO/AEO/GEO Schema", ["JSON-LD", "SEO", "AEO"], big="2 sites", bigsmall="hexalog.in and inhauscoffee.com"),
        "gtm-marketing-brain": typo("17", "GTM Marketing Brain", ["Notion", "YouTube API", "Reddit API"], big="4 databases", bigsmall="competitor and subreddit signals", size=160),
        "stock-forecaster": typo("18", "Stock Forecaster", ["Pandas", "scikit-learn", "Ensemble"], big="Buy / Hold", bigsmall="signals on IndusInd Bank", size=150),
        "subtracker": typo("19", "SubTracker", ["Bubble.io", "No-code", "FinTech"]),
        "deskflow": typo("20", "DeskFlow", ["Bubble.io", "No-code", "Productivity"]),
        "freshsales-mcp-server": typo("13", "Freshsales MCP Server", ["Node", "TypeScript", "218 fields"]),
    }

def main():
    only = set(sys.argv[1:])
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a, **k: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_port}"
    tiles = build_tiles()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1440, "height": 1080})
        for slug, html in tiles.items():
            if only and slug not in only: continue
            pg.goto(f"{base}/tools/thumbnails/frame.html", wait_until="networkidle")
            pg.evaluate("h=>{document.getElementById('inner').innerHTML=h}", html)
            pg.evaluate("document.fonts.ready")
            pg.wait_for_function("[...document.images].every(i=>i.complete)")
            pg.wait_for_timeout(400)
            png = pg.screenshot()
            im = Image.open(io.BytesIO(png)).convert("RGB")
            for size, suffix in (((1440, 1080), ""), ((720, 540), "-720")):
                q = 80
                while True:
                    buf = io.BytesIO(); im.resize(size, Image.LANCZOS).save(buf, "WEBP", quality=q, method=6)
                    if buf.tell() <= 120 * 1024 or q <= 40: break
                    q -= 5
                open(os.path.join(OUT, f"{slug}{suffix}.webp"), "wb").write(buf.getvalue())
                print(f"{slug}{suffix}.webp {buf.tell()//1024}KB q{q}")
        b.close()

if __name__ == "__main__":
    main()
