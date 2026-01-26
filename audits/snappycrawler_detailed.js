const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Auditoría Detallada - snappycrawler.com\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Capturar recursos de red
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (status >= 400) {
      console.log(`⚠️  Error en recurso: ${url} (${status})`);
    }
  });

  try {
    const response = await page.goto('https://snappycrawler.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('📊 ANÁLISIS DE CONTENIDO\n');

    // Estructura de la página
    const structure = await page.evaluate(() => {
      return {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
        paragraphs: document.querySelectorAll('p').length,
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        forms: document.querySelectorAll('form').length,
        links: document.querySelectorAll('a').length,
        images: document.querySelectorAll('img').length
      };
    });

    console.log('Título:', structure.title);
    console.log('\nH1:', structure.h1.length > 0 ? structure.h1[0] : '❌ No encontrado');
    console.log('H2s:', structure.h2.length);
    structure.h2.forEach((h, i) => console.log(`  ${i + 1}. ${h.substring(0, 60)}...`));
    console.log('\nElementos:');
    console.log(`  - Párrafos: ${structure.paragraphs}`);
    console.log(`  - Botones: ${structure.buttons}`);
    console.log(`  - Inputs: ${structure.inputs}`);
    console.log(`  - Forms: ${structure.forms}`);
    console.log(`  - Links: ${structure.links}`);
    console.log(`  - Imágenes: ${structure.images}`);

    // Análisis de texto
    console.log('\n📝 ANÁLISIS DE TEXTO\n');

    const textAnalysis = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const words = bodyText.split(/\s+/).filter(w => w.length > 0);

      return {
        totalWords: words.length,
        uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
        characterCount: bodyText.length,
        avgWordLength: words.reduce((a, b) => a + b.length, 0) / words.length
      };
    });

    console.log(`Total de palabras: ${textAnalysis.totalWords}`);
    console.log(`Palabras únicas: ${textAnalysis.uniqueWords}`);
    console.log(`Caracteres: ${textAnalysis.characterCount}`);
    console.log(`Longitud promedio de palabra: ${textAnalysis.avgWordLength.toFixed(2)} caracteres`);

    // Meta tags completos
    console.log('\n🏷️  META TAGS\n');

    const metaTags = await page.evaluate(() => {
      const getMeta = (name) => {
        const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return el ? el.getAttribute('content') : null;
      };

      return {
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        author: getMeta('author'),
        ogTitle: getMeta('og:title'),
        ogDescription: getMeta('og:description'),
        ogImage: getMeta('og:image'),
        twitterCard: getMeta('twitter:card'),
        viewport: getMeta('viewport'),
        charset: document.characterSet
      };
    });

    Object.entries(metaTags).forEach(([key, value]) => {
      if (value) {
        const display = value.length > 80 ? value.substring(0, 80) + '...' : value;
        console.log(`${key}: ${display}`);
      } else {
        console.log(`${key}: ⚠️  No definido`);
      }
    });

    // Scripts y estilos
    console.log('\n📦 RECURSOS\n');

    const resources = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
      const inlineScripts = document.querySelectorAll('script:not([src])').length;
      const inlineStyles = document.querySelectorAll('style').length;

      return {
        scripts,
        stylesheets,
        inlineScripts,
        inlineStyles,
        scriptCount: scripts.length,
        stylesheetCount: stylesheets.length
      };
    });

    console.log(`Scripts externos: ${resources.scriptCount}`);
    resources.scripts.forEach(s => console.log(`  - ${s.split('/').pop()}`));

    console.log(`\nStylesheets externos: ${resources.stylesheetCount}`);
    resources.stylesheets.forEach(s => console.log(`  - ${s.split('/').pop()}`));

    console.log(`\nScripts inline: ${resources.inlineScripts}`);
    console.log(`Estilos inline: ${resources.inlineStyles}`);

    // Performance metrics
    console.log('\n⚡ PERFORMANCE METRICS\n');

    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');

      return {
        dns: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        tcp: Math.round(perfData.connectEnd - perfData.connectStart),
        ttfb: Math.round(perfData.responseStart - perfData.requestStart),
        download: Math.round(perfData.responseEnd - perfData.responseStart),
        domParsing: Math.round(perfData.domInteractive - perfData.responseEnd),
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        windowLoad: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    console.log(`DNS Lookup: ${metrics.dns}ms`);
    console.log(`TCP Connection: ${metrics.tcp}ms`);
    console.log(`TTFB (Time to First Byte): ${metrics.ttfb}ms`);
    console.log(`Download Time: ${metrics.download}ms`);
    console.log(`DOM Parsing: ${metrics.domParsing}ms`);
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`Window Load: ${metrics.windowLoad}ms`);
    console.log(`First Paint: ${Math.round(metrics.firstPaint)}ms`);
    console.log(`First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);

    // Análisis de accesibilidad
    console.log('\n♿ ACCESIBILIDAD\n');

    const a11y = await page.evaluate(() => {
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt]), img[alt=""]'));
      const linksWithoutText = Array.from(document.querySelectorAll('a')).filter(a =>
        !a.textContent.trim() && !a.getAttribute('aria-label')
      );
      const inputsWithoutLabels = Array.from(document.querySelectorAll('input:not([type="hidden"])')).filter(input => {
        const id = input.getAttribute('id');
        if (!id) return true;
        return !document.querySelector(`label[for="${id}"]`);
      });

      return {
        imagesWithoutAlt: imagesWithoutAlt.length,
        linksWithoutText: linksWithoutText.length,
        inputsWithoutLabels: inputsWithoutLabels.length,
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
        landmarks: document.querySelectorAll('main, nav, header, footer, article, section, aside').length
      };
    });

    console.log(`Imágenes sin alt: ${a11y.imagesWithoutAlt}`);
    console.log(`Links sin texto: ${a11y.linksWithoutText}`);
    console.log(`Inputs sin labels: ${a11y.inputsWithoutLabels}`);
    console.log(`Elementos con aria-label: ${a11y.ariaLabels}`);
    console.log(`Landmarks (main, nav, etc): ${a11y.landmarks}`);

    // Análisis de UX/UI
    console.log('\n🎨 UX/UI ANALYSIS\n');

    const ux = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const clickableElements = Array.from(document.querySelectorAll('a, button, [onclick]'));
      const ctaElements = document.querySelectorAll('button, .btn, [class*="cta"], [class*="button"]');

      return {
        buttonCount: buttons.length,
        clickableCount: clickableElements.length,
        ctaCount: ctaElements.length,
        hasCTA: ctaElements.length > 0
      };
    });

    console.log(`Elementos clickeables: ${ux.clickableCount}`);
    console.log(`Botones: ${ux.buttonCount}`);
    console.log(`CTAs detectados: ${ux.hasCTA ? '✅ (' + ux.ctaCount + ')' : '⚠️  No detectados'}`);

    // Capturar screenshot de móvil
    console.log('\n📱 Capturando vista móvil...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: '/tmp/snappycrawler_mobile.png', fullPage: true });
    console.log('✅ Screenshot móvil guardado');

    // Capturar screenshot desktop
    console.log('\n🖥️  Capturando vista desktop...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: '/tmp/snappycrawler_desktop.png', fullPage: true });
    console.log('✅ Screenshot desktop guardado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Auditoría completada. Revisa los screenshots en /tmp/');
})();
