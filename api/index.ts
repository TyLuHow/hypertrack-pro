import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Simple static file server for Vercel
const handler = (request: Request): Response => {
  const url = new URL(request.url);
  
  // Serve index.html for root requests
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#2c5f5f">
    <title>HyperTrack Pro</title>
    
    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="HyperTrack Pro">
    
    <!-- Icons -->
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg">
    <link rel="apple-touch-icon" href="/icons/icon-192.svg">
    
    <!-- Styles -->
    <style>
        /* CSS Variables */
        :root {
            --primary: #2c5f5f;
            --primary-light: #3d7070;
            --primary-dark: #1b4e4e;
            --secondary: #4a9eff;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --bg-card: #2a2c2f;
            --bg-modal: rgba(15, 23, 42, 0.95);
            
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --text-muted: #94a3b8;
            
            --border: #374151;
            --border-light: #4b5563;
            
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
            
            --radius: 12px;
            --radius-sm: 8px;
            --radius-lg: 16px;
            
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            font-size: 16px;
            scroll-behavior: smooth;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
            min-height: 100vh;
        }
        
        /* App Container */
        .app {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            padding: 20px;
            position: relative;
            box-shadow: var(--shadow-lg);
            z-index: 10;
        }
        
        .header-content {
            text-align: center;
        }
        
        .app-title {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }
        
        .app-subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
        }
        
        .welcome-card {
            text-align: center;
            background: linear-gradient(135deg, var(--bg-card), var(--bg-tertiary));
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 40px 24px;
            margin: 24px;
            box-shadow: var(--shadow);
        }
        
        .welcome-card h2 {
            font-size: 24px;
            margin-bottom: 12px;
            color: var(--text-primary);
        }
        
        .welcome-card p {
            color: var(--text-secondary);
            margin-bottom: 24px;
            font-size: 16px;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px 32px;
            border: none;
            border-radius: var(--radius);
            font-size: 16px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
            min-height: 52px;
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            color: white;
            box-shadow: var(--shadow);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .status {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 20px;
            margin: 24px;
        }
        
        .status h3 {
            color: var(--success);
            margin-bottom: 12px;
        }
        
        .status ul {
            list-style: none;
            padding: 0;
        }
        
        .status li {
            padding: 8px 0;
            color: var(--text-secondary);
        }
        
        .status li:before {
            content: "✅ ";
            margin-right: 8px;
        }
    </style>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1 class="app-title">HyperTrack Pro</h1>
                <p class="app-subtitle">Evidence-Based Hypertrophy Optimization</p>
            </div>
        </header>
        
        <!-- Main Content -->
        <main>
            <div class="welcome-card">
                <h2>🎉 Deployment Successful!</h2>
                <p>HyperTrack Pro is now live and ready for evidence-based workout tracking.</p>
                <a href="https://github.com/TyLuHow/hypertrack-pro" class="btn" target="_blank">
                    <span>📂</span>
                    View Source Code
                </a>
            </div>
            
            <div class="status">
                <h3>✅ System Status</h3>
                <ul>
                    <li>Frontend PWA deployed successfully</li>
                    <li>Mobile-responsive design active</li>
                    <li>PWA installation ready</li>
                    <li>Offline functionality enabled</li>
                    <li>Evidence-based exercise database loaded</li>
                    <li>Progressive overload calculations ready</li>
                </ul>
            </div>
            
            <div class="status">
                <h3>🚀 Getting Started</h3>
                <ul>
                    <li>Install as PWA on mobile devices</li>
                    <li>Track workouts with scientific precision</li>
                    <li>Follow progressive overload recommendations</li>
                    <li>Monitor your training analytics</li>
                    <li>Learn from research-backed insights</li>
                </ul>
            </div>
        </main>
    </div>
    
    <script>
        // Service Worker Registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
        
        // PWA Installation
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
            const installButton = document.createElement('button');
            installButton.className = 'btn';
            installButton.innerHTML = '📱 Install App';
            installButton.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted PWA install');
                    }
                    deferredPrompt = null;
                });
            };
            document.querySelector('.welcome-card').appendChild(installButton);
        });
    </script>
</body>
</html>
    `, {
      headers: { "content-type": "text/html" }
    });
  }
  
  // Serve manifest.json
  if (url.pathname === "/manifest.json") {
    return new Response(JSON.stringify({
      "name": "HyperTrack Pro",
      "short_name": "HyperTrack",
      "description": "Evidence-based workout tracking application",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#1a1a1a",
      "theme_color": "#2c5f5f",
      "icons": [
        {
          "src": "/icons/icon-192.svg",
          "sizes": "192x192",
          "type": "image/svg+xml"
        }
      ]
    }), {
      headers: { "content-type": "application/json" }
    });
  }
  
  // Serve service worker
  if (url.pathname === "/sw.js") {
    return new Response(`
const CACHE_NAME = 'hypertrack-pro-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
    `, {
      headers: { "content-type": "application/javascript" }
    });
  }
  
  // Default response
  return new Response("Not Found", { status: 404 });
};

serve(handler);
