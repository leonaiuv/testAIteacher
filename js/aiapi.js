// aiapi.js
// 支持 deepseek、qwen（通义千问）、AihubMix、火山引擎（字节豆包）、Moonshot、智谱、MiniMax、360等 OpenAI 协议大模型
// 若需特殊适配header，可补充if分支

/**
 * 判断模型是否支持reasoning_content
 * @param {string} modelName
 */
function isReasoningModel(modelName) {
    // deepseek-coder/一些大模型有reasoning_content
    return /deepseek.*coder/i.test(modelName);
  }
  
  /**
   * 获取各厂商的实际BaseURL前缀（如用户未填，或提供了常见厂商名）
   */
  function getVendorBaseUrl(apiPack) {
    // 用户自定义填写优先
    if (apiPack.baseUrl && apiPack.baseUrl.trim() !== "") return apiPack.baseUrl.trim();
    // 常见默认
    switch (apiPack.vendor) {
      case "deepseek":   return "https://api.deepseek.com";
      case "qwen":       return "https://dashscope.aliyuncs.com";
      case "aihubmix":   return "https://open.bigmodel.cn";
      case "volcengine": return "https://open.volcengineapi.com";
      case "moonshot":   return "https://api.moonshot.cn";
      // ...可补充其它
      default:           return "";
    }
  }
  
  /**
   * 各厂商的header处理
   */
  function getVendorHeaders(apiPack) {
    const headers = {
      "Content-Type": "application/json"
    };
    // deepseek、moonshot、qwen、aihubmix、volcengine都兼容openai协议
    switch (apiPack.vendor) {
      case "qwen": // 阿里千问-dashscope
        headers["Authorization"] = `Bearer ${apiPack.apiKey}`;
        break;
      case "aihubmix":
        headers["Authorization"] = `Bearer ${apiPack.apiKey}`;
        break;
      case "volcengine":
        headers["Authorization"] = `Bearer ${apiPack.apiKey}`;
        break;
      case "deepseek":
      case "moonshot":
      case "custom":
      default:
        headers["Authorization"] = `Bearer ${apiPack.apiKey}`;
        break;
    }
    return headers;
  }
  
  /**
   * 是否特殊处理返回流格式
   */
  function isQwenStream(apiPack) {
    // qwen/dashscope流式输出和OpenAI略有不同（data: {...}\n）
    return apiPack.vendor === "qwen";
  }
  function isVolcengineStream(apiPack) {
    // 火山引擎流式输出和OpenAI略有不同
    return apiPack.vendor === "volcengine";
  }
  
  /**
   * 统一AI调用接口
   * @param {Object} apiPack
   * @param {Array} messages
   * @param {Function} onStream (contentChunk, reasoningChunk)=>void
   */
  async function callAI(apiPack, messages, onStream) {
    // 统一接口
    let baseUrl = getVendorBaseUrl(apiPack);
    if (!baseUrl) throw new Error("未填写BaseURL");
  
    let url = baseUrl;
    // 各厂商路径不同
    switch (apiPack.vendor) {
      case "qwen":
        url += "/api/v1/completions"; // dashscope新版OpenAI协议
        break;
      case "aihubmix":
        url += "/api/paas/v4/chat/completions";
        break;
      case "volcengine":
        url += "/api/v1/chat/completions";
        break;
      case "deepseek":
      case "moonshot":
      case "custom":
      default:
        url += "/v1/chat/completions";
        break;
    }
  
    const reqBody = {
      model: apiPack.model,
      messages,
      stream: true
    };
  
    // AihubMix可能需要extra参数，volcengine可能需extra参数，根据需要补充
    // 例如 if(apiPack.vendor==="aihubmix"){ reqBody.extra = ...; }
  
    const headers = getVendorHeaders(apiPack);
  
    // 请求流式输出
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(reqBody)
    });
  
    if (!resp.ok) {
      throw new Error("API请求失败：" + resp.status + " " + resp.statusText);
    }
  
    // 处理stream
    const reader = resp.body.getReader();
    let fullContent = "";
    let reasoningContent = "";
    let decoder = new TextDecoder("utf-8");
    let done, value;
    while (true) {
      ({done, value} = await reader.read());
      if (done) break;
      let chunk = decoder.decode(value, {stream: true});
      // 流式格式不同的处理
      if (isQwenStream(apiPack)) {
        // qwen dashscope流：data: {...}\n
        chunk.split("\n").forEach(line => {
          line = line.trim();
          if (!line.startsWith("data:")) return;
          const data = line.slice(5);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              const delta = parsed.choices[0].delta;
              if (delta.content) {
                fullContent += delta.content;
                onStream(delta.content, "");
              }
            }
          } catch(e) { }
        });
      } else if (isVolcengineStream(apiPack)) {
        // 火山引擎流格式：data: {...}\n
        chunk.split("\n").forEach(line => {
          line = line.trim();
          if (!line.startsWith("data:")) return;
          const data = line.slice(5);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              const delta = parsed.choices[0].delta;
              if (delta.content) {
                fullContent += delta.content;
                onStream(delta.content, "");
              }
            }
          } catch(e) { }
        });
      } else {
        // OpenAI/Deepseek/AihubMix/Moonshot标准流
        chunk.split("\n").forEach(line => {
          line = line.trim();
          if (!line.startsWith("data:")) return;
          const data = line.slice(5);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              const delta = parsed.choices[0].delta;
              if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                onStream("", delta.reasoning_content);
              } else if (delta.content) {
                fullContent += delta.content;
                onStream(delta.content, "");
              }
            }
          } catch (e) { }
        });
      }
    }
    return {content: fullContent, reasoning: reasoningContent};
  }
  