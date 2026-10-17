/* ============================================================================
 * UniFlow Boot-Time Version & Cache Integrity Guard
 * Ensures the browser never stays stuck on a stale index.html or old SW cache.
 * ============================================================================ */
;(function () {
  var EXPECTED_BUILD_ID = '__BUILD_ID__'
  var STORAGE_KEY = 'uniflow:active-build-id'
  var RELOAD_GUARD_KEY = 'uniflow:version-reload-at'

  if (typeof window === 'undefined' || typeof fetch === 'undefined') return
  if (navigator && navigator.onLine === false) return

  function canReloadNow() {
    try {
      var last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0')
      var now = Date.now()
      if (last && now - last < 12000) return false
      sessionStorage.setItem(RELOAD_GUARD_KEY, String(now))
      return true
    } catch (_) {
      return true
    }
  }

  function purgeAllCachesExcept(keepCacheName) {
    if (!('caches' in window)) return Promise.resolve()
    return caches
      .keys()
      .then(function (names) {
        return Promise.all(
          names.map(function (name) {
            if (keepCacheName && name === keepCacheName) return Promise.resolve(false)
            return caches.delete(name)
          })
        )
      })
      .catch(function () {})
  }

  function refreshServiceWorkers() {
    if (!('serviceWorker' in navigator)) return Promise.resolve()
    return navigator.serviceWorker
      .getRegistrations()
      .then(function (regs) {
        return Promise.all(
          regs.map(function (reg) {
            if (reg.waiting) {
              try {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' })
              } catch (_) {}
            }
            return reg.update().catch(function () {})
          })
        )
      })
      .catch(function () {})
  }

  function reloadWithCacheBust(targetBuildId) {
    if (!canReloadNow()) return
    try {
      var url = new URL(window.location.href)
      url.searchParams.set('_v', targetBuildId || String(Date.now()))
      window.location.replace(url.toString())
    } catch (_) {
      window.location.reload()
    }
  }

  fetch('/precache-manifest.json?_t=' + Date.now(), {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  })
    .then(function (res) {
      if (!res || !res.ok) return null
      return res.json()
    })
    .then(function (manifest) {
      if (!manifest || !manifest.buildId) return
      var remoteBuildId = String(manifest.buildId)
      var keepCache = 'uniflow-pwa-' + remoteBuildId
      var storedBuildId = null
      try {
        storedBuildId = localStorage.getItem(STORAGE_KEY)
      } catch (_) {}

      // Check if the HTML document itself is stale compared to the remote manifest
      var isBuiltBundle = EXPECTED_BUILD_ID && EXPECTED_BUILD_ID !== '__BUILD' + '_ID__'
      var htmlMismatch = isBuiltBundle && EXPECTED_BUILD_ID !== remoteBuildId

      // Also verify the entry script tag in the DOM matches the manifest's critical entry JS
      if (!htmlMismatch && Array.isArray(manifest.assets)) {
        var criticalJs = manifest.assets.filter(function (a) {
          return a && a.critical && typeof a.url === 'string' && a.url.indexOf('/assets/index-') === 0 && a.url.slice(-3) === '.js'
        })[0]
        var domScript = document.querySelector('script[type="module"][src*="/assets/index-"]')
        if (criticalJs && domScript) {
          var domSrc = domScript.getAttribute('src') || ''
          if (domSrc && domSrc.indexOf(criticalJs.url) === -1) {
            htmlMismatch = true
          }
        }
      }

      if (storedBuildId !== remoteBuildId || htmlMismatch) {
        try {
          localStorage.setItem(STORAGE_KEY, remoteBuildId)
        } catch (_) {}

        Promise.all([purgeAllCachesExcept(keepCache), refreshServiceWorkers()]).then(function () {
          if (htmlMismatch) {
            reloadWithCacheBust(remoteBuildId)
          }
        })
      }
    })
    .catch(function () {})
})()
