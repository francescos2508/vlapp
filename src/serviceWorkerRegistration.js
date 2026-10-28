// Simple service worker registration
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
.then(reg => {
          console.log('✅ Service worker registered:', reg);

          // check for new version od service worker
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New version available!');

                    alert('New version available, it will take some seconds.');

                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                  } else {
                    console.log('First installation completed successfully.');
                  }
                }
              };
            }
          };
        })
        .catch(err => {
          console.error('❌ Service worker registration failed:', err);
        });

    });
  }
}
