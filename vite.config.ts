import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function suppressViteWsPlugin(): Plugin {
  return {
    name: 'suppress-vite-ws-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const suppressionScript = `
    <script>
      (function() {
        var _err = console.error;
        var _warn = console.warn;
        var _dbg = console.debug;
        function isViteWs(args) {
          for (var i = 0; i < args.length; i++) {
            var a = args[i];
            if (a) {
              if (typeof a === 'string' && (a.indexOf('[vite]') !== -1 || a.indexOf('WebSocket') !== -1 || a.indexOf('websocket') !== -1)) return true;
              if (a.message && (a.message.indexOf('[vite]') !== -1 || a.message.indexOf('WebSocket') !== -1 || a.message.indexOf('websocket') !== -1)) return true;
            }
          }
          return false;
        }
        console.error = function() {
          if (isViteWs(arguments)) return;
          _err.apply(console, arguments);
        };
        console.warn = function() {
          if (isViteWs(arguments)) return;
          _warn.apply(console, arguments);
        };
        console.debug = function() {
          if (isViteWs(arguments)) return;
          _dbg.apply(console, arguments);
        };
        window.addEventListener('error', function(e) {
          if (e && e.message && (e.message.indexOf('WebSocket') !== -1 || e.message.indexOf('[vite]') !== -1)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return true;
          }
        }, true);
        window.addEventListener('unhandledrejection', function(e) {
          if (e && e.reason) {
            var m = typeof e.reason === 'string' ? e.reason : (e.reason.message || '');
            if (m.indexOf('WebSocket') !== -1 || m.indexOf('[vite]') !== -1) {
              e.preventDefault();
              e.stopImmediatePropagation();
              return true;
            }
          }
        }, true);
        if (typeof window !== 'undefined' && window.WebSocket) {
          var OrigWS = window.WebSocket;
          window.WebSocket = function(url, protocols) {
            var isHmr = (typeof protocols === 'string' && protocols.indexOf('vite-hmr') !== -1) ||
                        (Array.isArray(protocols) && protocols.indexOf('vite-hmr') !== -1) ||
                        (typeof url === 'string' && url.indexOf('vite-hmr') !== -1);
            if (isHmr) {
              var target = new EventTarget();
              target.binaryType = 'blob';
              target.readyState = 1;
              target.bufferedAmount = 0;
              target.extensions = '';
              target.protocol = 'vite-hmr';
              target.url = String(url);
              target.onopen = null;
              target.onclose = null;
              target.onerror = null;
              target.onmessage = null;
              target.send = function() {};
              target.close = function() { target.readyState = 3; };
              setTimeout(function() {
                if (typeof target.onopen === 'function') target.onopen(new Event('open'));
                target.dispatchEvent(new Event('open'));
              }, 20);
              return target;
            }
            return new OrigWS(url, protocols);
          };
          window.WebSocket.prototype = OrigWS.prototype;
          window.WebSocket.CONNECTING = 0;
          window.WebSocket.OPEN = 1;
          window.WebSocket.CLOSING = 2;
          window.WebSocket.CLOSED = 3;
        }
      })();
    </script>`;
        return html.replace('<head>', '<head>' + suppressionScript);
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [suppressViteWsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
