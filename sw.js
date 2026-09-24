/* CF ArritmiX v1.8.4 — service-worker de migração/limpeza.
   Remove caches legados (incluindo o antigo "financeflow") e não intercepta
   requisições. O app permanece dependente apenas do cache HTTP normal do navegador. */
const CF_SW_VERSION = 'cf-arritmix-v1.8.4';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
