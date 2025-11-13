/**
 * Coffee Analytics - 超軽量トラッキングスクリプト
 * < 1KB (gzip圧縮で900バイト以下)
 */
(function () {
  'use strict';

  // 設定取得
  // trackingIdはURLから取得（/js/ca-{trackingId}.js形式）
  const script = document.currentScript || document.querySelector('script[src*="ca-"]');
  const scriptUrl = script?.src || '';
  const urlMatch = scriptUrl.match(/ca-([^.]+)\.js/);
  const siteId = urlMatch ? urlMatch[1] : null;
  if (!siteId) return;

  // エンドポイントURLの取得
  // スクリプトのURLからトラッキングサーバーのURLを推測
  // 例: https://analytics.example.com/js/ca-xxx.js -> https://analytics.example.com/track
  let endpointUrl;
  if (scriptUrl) {
    try {
      const url = new URL(scriptUrl);
      endpointUrl = url.origin + '/track';
    } catch (e) {
      // URL解析に失敗した場合は、data-endpoint属性を確認（後方互換性）
      const endpointAttr = script?.getAttribute('data-endpoint');
      if (endpointAttr) {
        if (endpointAttr.startsWith('http://') || endpointAttr.startsWith('https://')) {
          endpointUrl = endpointAttr;
        } else {
          endpointUrl = window.location.origin + (endpointAttr.startsWith('/') ? endpointAttr : '/' + endpointAttr);
        }
      } else {
        endpointUrl = window.location.origin + '/track'; // デフォルト
      }
    }
  } else {
    // フォールバック: data-endpoint属性を確認（後方互換性）
    const endpointAttr = script?.getAttribute('data-endpoint');
    if (endpointAttr) {
      if (endpointAttr.startsWith('http://') || endpointAttr.startsWith('https://')) {
        endpointUrl = endpointAttr;
      } else {
        endpointUrl = window.location.origin + (endpointAttr.startsWith('/') ? endpointAttr : '/' + endpointAttr);
      }
    } else {
      endpointUrl = window.location.origin + '/track'; // デフォルト
    }
  }

  // ユーティリティ関数
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  // フィンガープリント生成（Cookie不使用）
  const getFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Coffee Analytics', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');
    
    return hash(fingerprint);
  };

  // セッションハッシュ（30分で更新）
  const getSessionHash = () => {
    const sessionKey = 'ca_session';
    let session = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    
    if (!session) {
      session = hash(getFingerprint() + now);
      sessionStorage.setItem(sessionKey, session + '_' + now);
    } else {
      const [hash, timestamp] = session.split('_');
      // 30分経過で新しいセッション
      if (now - parseInt(timestamp) > 30 * 60 * 1000) {
        session = hash(getFingerprint() + now);
        sessionStorage.setItem(sessionKey, session + '_' + now);
      } else {
        session = hash;
      }
    }
    
    return session;
  };

  // デバイス情報取得
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const width = screen.width;
    const height = screen.height;
    
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad/i.test(ua)) {
      deviceType = width < 768 ? 'mobile' : 'tablet';
    }
    
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'chrome';
    else if (ua.includes('Firefox')) browser = 'firefox';
    else if (ua.includes('Safari')) browser = 'safari';
    else if (ua.includes('Edge')) browser = 'edge';
    
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'windows';
    else if (ua.includes('Mac')) os = 'macos';
    else if (ua.includes('Linux')) os = 'linux';
    else if (ua.includes('Android')) os = 'android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'ios';
    
    return {
      deviceType,
      screenSize: width + 'x' + height,
      browser,
      os,
    };
  };

  // イベント送信
  const track = (eventType, eventName, eventValue) => {
    const data = {
      siteId,
      eventType: eventType || 'pageview',
      visitorHash: getFingerprint(),
      sessionHash: getSessionHash(),
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || '',
      ...getDeviceInfo(),
      eventName: eventName || null,
      eventValue: eventValue || null,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Beacon API使用（可能な場合）
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpointUrl, blob);
    } else {
      // フォールバック: fetch
      fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {}); // エラーは無視
    }
  };

  // ページビュー追跡
  const trackPageview = () => {
    track('pageview');
  };

  // SPA対応: History API監視
  let lastUrl = window.location.href;
  const checkUrl = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      trackPageview();
    }
  };

  // 初期ページビュー
  if (document.readyState === 'complete') {
    trackPageview();
  } else {
    window.addEventListener('load', trackPageview);
  }

  // SPA対応: pushState/replaceState監視
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(checkUrl, 0);
  };
  
  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(checkUrl, 0);
  };
  
  window.addEventListener('popstate', checkUrl);

  // グローバルAPI公開
  window.ca = window.ca || {};
  window.ca.track = track;
  window.ca.trackEvent = (name, value) => track('event', name, value);
  window.ca.init = window.ca.init || function(i) { window.ca.o = i || {}; };
  
  // 自動初期化（既に初期化されている場合はスキップ）
  if (!window.ca.o) {
    window.ca.init();
  }
})();

