console.log('Script loaded!')
var cacheStorageKey = 'lte-pwa'

var cacheList = ['/', "index.html", "main.css", "256x256.png", "pwa-fonts.png"]

// 监听 service worker 的 install 事件
self.addEventListener('install', function(event) {
    console.log('Cache event!')
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open(cacheStorageKey).then(function(cache) {
            console.log('Adding to Cache:', cacheList)
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll(cacheList)
        }).then(function() {
            console.log('Skip waiting!')
            return self.skipWaiting()
        })
    )
})

self.addEventListener('activate', function(event) {
    console.log('Activate event')
    event.waitUntil(
        Promise.all([
            // 更新客户端，取得页面的控制权
            self.clients.claim(),

            // 清理旧版本
            caches.keys().then(function(cacheList) {
                return Promise.all(
                    cacheList.map(function(cacheName) {
                        if (cacheName !== cacheStorageKey) {
                            return caches.delete(cacheName)
                        }
                    })
                )
            })
        ])
    )
})

self.addEventListener('fetch', function(event) {
    // console.log('Fetch event:', e.request.url)
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response != null) {
                self.registration.showNotification('Using cache for:' + event.request.url)
                console.log('Using cache for:', event.request.url)
                return response
            }
            console.log('Fallback to fetch:', event.request.url)
            return fetch(event.request.url)

            // // 如果 service worker 没有返回，那就得直接请求真实远程服务
            // var request = event.request.clone(); // 把原始请求拷过来
            // return fetch(request).then(function (httpRes) {
            //
            //     // http请求的返回已被抓到，可以处置了。
            //
            //     // 请求失败了，直接返回失败的结果就好了。。
            //     if (!httpRes || httpRes.status !== 200) {
            //         return httpRes;
            //     }
            //
            //     // 请求成功的话，将请求缓存起来。
            //     var responseClone = httpRes.clone();
            //     caches.open(cacheStorageKey).then(function (cache) {
            //         cache.put(event.request, responseClone);
            //     });
            //
            //     return httpRes;
            // });
        })
    )
})
