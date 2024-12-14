// functions/api/[[route]].js 
// route 可以删除

// 2024-10-17更新，可自动处理结尾的/v1beta
// 流模式下会有最后一句话重复的问题，暂未找到具体原因，推荐先关闭流

const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

export async function onRequest(context) {
  try {
    // 获取请求的URL
    const url = new URL(context.request.url);
    // 将目标URL的主机名设置到请求URL中
    url.host = TELEGRAPH_URL.replace(/^https?:\/\//, '');

    // 获取请求URL中提供的API密钥参数
    const providedApiKeys = url.searchParams.get('key');

    // 检查是否提供了API密钥
    if (!providedApiKeys) {
      return new Response('API key is missing.', { status: 400 });
    }

    // 将提供的API密钥字符串分割成数组，并去除空格和空字符串
    const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');

    // 检查是否有有效的API密钥
    if (apiKeyArray.length === 0) {
      return new Response('Valid API key is missing.', { status: 400 });
    }

    // 随机选择一个API密钥
    const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
    // 将选定的API密钥设置回请求URL中
    url.searchParams.set('key', selectedApiKey);

    // 创建一个新的请求对象，复制原始请求的头部、方法和主体
    const modifiedRequest = new Request(url.toString(), {
      headers: context.request.headers,
      method: context.request.method,
      body: context.request.body,
      redirect: 'follow'
    });

    // 发送修改后的请求到目标URL
    const response = await fetch(modifiedRequest);

    // 检查API请求是否成功
    if (!response.ok) {
      // 如果不成功，读取错误响应体并返回错误信息
      const errorBody = await response.text();
      return new Response(`API request failed: ${errorBody}`, { status: response.status });
    }

    // 创建一个新的响应对象，使用原始响应的主体和状态
    const modifiedResponse = new Response(response.body, response);
    // 设置响应头允许跨域访问
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    // 返回修改后的响应
    return modifiedResponse;

  } catch (error) {
    // 捕获并返回错误信息
    return new Response('An error occurred: ' + error.message, { status: 500 });
  }
}
