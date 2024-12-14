// 2024-10-17更新，可自动处理结尾的/v1beta
// 流模式下会有最后一句话重复的问题，暂未找到具体原因，推荐先关闭流
const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    url.host = TELEGRAPH_URL.replace(/^https?:\/\//, '');

    const providedApiKeys = url.searchParams.get('key');

    if (!providedApiKeys) {
      return new Response('API key is missing.', { status: 400 });
    }

    const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');

    if (apiKeyArray.length === 0) {
      return new Response('Valid API key is missing.', { status: 400 });
    }

    const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
    url.searchParams.set('key', selectedApiKey);

    const modifiedRequest = new Request(url.toString(), {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow'
    });

    const response = await fetch(modifiedRequest);

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(`API request failed: ${errorBody}`, { status: response.status });
    }

    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    return modifiedResponse;

  } catch (error) {
    return new Response('An error occurred: ' + error.message, { status: 500 });
  }
}
