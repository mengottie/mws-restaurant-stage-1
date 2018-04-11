var staticCacheName = 'restaurant-review-v11'
var variableContentCacheName = 'restaurant-review-var-content-v11';

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
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/data/')) {
        event.respondWith(serveJSON(event.request));
        return;
      }
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(serveDetail(event.request));
        return;
    }
  }
  if (requestUrl.pathname === '/') {
      console.log(requestUrl.pathname);
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

    return caches.open(variableContentCacheName).then(function(cache) {
      return cache.match(storageUrl).then(function(response) {
        if (response) return response;

        return fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }

function serveJSON(request) {
    return caches.open(variableContentCacheName).then(function(cache){
        return cache.match(request).then(function(response){
            if (response) return response;

            return fetch(request).then(function(netResposnse){
                cache.put(request, netResposnse.clone());
                return netResposnse;
            })
        })
    });
}

function serveDetail(request) {
    let req = request.clone;
    console.log('request: ' + req);
    return caches.open(staticCacheName).then(function(cache){
        return cache.match(request).then(function(response){
            if (response) {
                return response;
            }
            return fetch(request)
        })
    });
}