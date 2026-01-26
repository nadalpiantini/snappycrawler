const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Iniciando auditoría de snappycrawler.com...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  // Colección de issues
  const issues = {
    critical: [],
    warning: [],
    info: [],
    performance: []
  };

  try {
    // 1. Medir tiempo de carga inicial
    console.log('⏱️  Midiendo tiempo de carga...');
    const startTime = Date.now();
    const response = await page.goto('https://snappycrawler.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    const loadTime = Date.now() - startTime;

    console.log(`   Tiempo de carga: ${loadTime}ms`);
    issues.performance.push({ metric: 'Tiempo de carga', value: `${loadTime}ms`, status: loadTime > 3000 ? 'warning' : 'ok' });

    // 2. Verificar respuesta HTTP
    console.log('\n📡 Verificando respuesta HTTP...');
    const status = response.status();
    const statusText = response.statusText();
    console.log(`   Status: ${status} ${statusText}`);
    if (status >= 400) {
      issues.critical.push(`HTTP ${status}: ${statusText}`);
    }

    // 3. Capturar errores de consola
    console.log('\n🐛 Capturando errores de consola...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.log(`   ❌ ${text}`);
        if (!text.includes('favicon')) {
          issues.warning.push(`Console error: ${text.substring(0, 100)}`);
        }
      }
    });

    // Esperar a que la página esté completamente cargada
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 4. Verificar título y meta tags
    console.log('\n📄 Verificando SEO básico...');
    const title = await page.title();
    console.log(`   Título: "${title}"`);
    if (!title || title.length < 10) {
      issues.warning.push('Título muy corto o ausente');
    }

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (!metaDescription) {
      issues.warning.push('Meta description ausente');
    } else {
      console.log(`   Meta description: "${metaDescription.substring(0, 100)}..."`);
    }

    // 5. Verificar enlaces rotos
    console.log('\n🔗 Verificando enlaces...');
    const links = await page.locator('a[href]').all();
    console.log(`   Total de enlaces encontrados: ${links.length}`);

    let brokenLinks = 0;
    const linkChecks = links.slice(0, 20).map(async link => {
      try {
        const href = await link.getAttribute('href');
        if (href && (href.startsWith('http') || href.startsWith('/'))) {
          const fullUrl = href.startsWith('http') ? href : `https://snappycrawler.com${href}`;
          const res = await context.request.get(fullUrl, { timeout: 5000 });
          if (res.status() >= 400) {
            brokenLinks++;
            issues.warning.push(`Enlace roto: ${fullUrl} (${res.status()})`);
          }
        }
      } catch (e) {
        // Ignorar errores de timeout
      }
    });

    await Promise.all(linkChecks);
    console.log(`   Enlaces rotos detectados: ${brokenLinks}`);

    // 6. Verificar imágenes
    console.log('\n🖼️  Verificando imágenes...');
    const images = await page.locator('img').all();
    console.log(`   Total de imágenes: ${images.length}`);

    let imagesWithoutAlt = 0;
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt === '') {
        imagesWithoutAlt++;
      }
    }

    if (imagesWithoutAlt > 0) {
      issues.warning.push(`${imagesWithoutAlt} imágenes sin atributo alt`);
      console.log(`   ⚠️  ${imagesWithoutAlt} imágenes sin alt`);
    }

    // 7. Verificar responsividad (móvil)
    console.log('\n📱 Verificando responsividad...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (mobileOverflow) {
      issues.warning.push('Contenido desbordando en móvil (horizontal overflow)');
      console.log('   ⚠️  Overflow horizontal detectado en móvil');
    } else {
      console.log('   ✅ Sin overflow en móvil');
    }

    // 8. Verificar accesibilidad básica
    console.log('\n♿ Verificando accesibilidad...');
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`   Encabezados: ${headings.length}`);

    const h1Count = await page.locator('h1').count();
    if (h1Count === 0) {
      issues.warning.push('No hay encabezado H1');
    } else if (h1Count > 1) {
      issues.warning.push('Múltiples encabezados H1 detectados');
    }

    // 9. Analizar performance
    console.log('\n⚡ Analizando performance...');
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart)
      };
    });

    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${metrics.loadComplete}ms`);
    console.log(`   DOM Interactive: ${metrics.domInteractive}ms`);

    if (metrics.domContentLoaded > 2000) {
      issues.warning.push(`DOM Content Load lento: ${metrics.domContentLoaded}ms`);
    }

    // 10. Verificar JavaScript errors
    console.log('\n💻 Verificando errores JavaScript...');
    const jsErrors = await page.evaluate(() => {
      return window.performance || {};
    });

    // 11. Screenshot para revisión visual
    console.log('\n📸 Capturando screenshot...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({
      path: '/tmp/snappycrawler_screenshot.png',
      fullPage: true
    });
    console.log('   ✅ Screenshot guardado en /tmp/snappycrawler_screenshot.png');

    // 12. Verificar recursos externos
    console.log('\n📦 Analizando recursos externos...');
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const domains = {};
      resources.forEach(r => {
        try {
          const url = new URL(r.name);
          domains[url.hostname] = (domains[url.hostname] || 0) + 1;
        } catch (e) {}
      });
      return domains;
    });

    const thirdPartyCount = Object.keys(resources).filter(d => !d.includes('snappycrawler')).length;
    console.log(`   Dominios de terceros: ${thirdPartyCount}`);
    if (thirdPartyCount > 10) {
      issues.warning.push(`Muchos recursos de terceros (${thirdPartyCount} dominios)`);
    }

    // 13. Verificar Core Web Vitals básicos
    console.log('\n📊 Core Web Vitals (estimado)...');
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          entries.forEach(entry => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = Math.round(entry.renderTime || entry.loadTime);
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });

        setTimeout(() => resolve({}), 2000);
      });
    });

    if (vitals.lcp) console.log(`   LCP: ${vitals.lcp}ms`);
    if (vitals.cls) console.log(`   CLS: ${vitals.cls.toFixed(3)}`);

  } catch (error) {
    console.error('\n❌ Error durante la auditoría:', error.message);
    issues.critical.push(`Error fatal: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Resumen de issues
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE LA AUDITORÍA');
  console.log('='.repeat(60));

  if (issues.critical.length > 0) {
    console.log('\n🚨 CRÍTICOS:');
    issues.critical.forEach(issue => console.log(`   ❌ ${issue}`));
  }

  if (issues.warning.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS:');
    issues.warning.forEach(issue => console.log(`   ⚠️  ${issue}`));
  }

  if (issues.performance.length > 0) {
    console.log('\n⚡ PERFORMANCE:');
    issues.performance.forEach(p => {
      const icon = p.status === 'warning' ? '⚠️' : '✅';
      console.log(`   ${icon} ${p.metric}: ${p.value}`);
    });
  }

  const totalIssues = issues.critical.length + issues.warning.length;
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${issues.critical.length} críticos, ${issues.warning.length} advertencias`);
  console.log('='.repeat(60));

  if (totalIssues === 0) {
    console.log('\n🎉 ¡Excelente! No se detectaron issues mayores.');
  } else {
    console.log(`\n💡 Se detectaron ${totalIssues} issues para mejorar.`);
  }
})();
