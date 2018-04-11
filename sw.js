var staticCacheName = 'restaurant-review-v13';

self.addEventListener('install', function(event) {
  console.log('install service worker: ' + event);
  event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
          'index.html',
          'restaurant.html',
          'css/styles.css',
          'js/main.js',
          'js/restaurant_info.js',
          'js/dbhelper.js',
          'data/restaurants.json',
          'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
          'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    }).catch(function(error){
        console.log(error);
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  console.log(requestUrl.pathname);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(serveDetail(event.request));
        return;
    }
  }
  if (requestUrl.pathname === '/') {
    requestUrl.pathname = '/index.html';
  }
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function servePhoto(request) {
    let storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(staticCacheName).then(function(cache) {
      return cache.match(storageUrl).then(function(response) {
        if (response) return response;

        return fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }

function serveDetail(request) {
    let req = request.clone;
    console.log(req);
    let storageUrl = req.url;
    return caches.open(staticCacheName).then(function(cache){
        return cache.match(storageUrl).then(function(response){
            if (response) {
                return response;
            }
            return fetch(request)
        })
    });
}