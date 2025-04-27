// aiapi.js
// 封装AI厂商API的调用和流式输出

// 判断模型是否支持思维链
function isReasoningModel(modelName) {
    // deepseek等部分模型支持reasoning_content
    // 如deepseek-coder等
    return /deepseek.*coder/i.test(modelName);
  }
  
  /**
   * 使用指定API包和模型，发起AI聊天请求
   * @param {Object} apiPack - {vendor, name, apiKey, baseUrl, model, systemPrompt}
   * @param {Array} messages - [{role,content}]
   * @param {Function} onStream - (chunkContent, reasoningContent) => void
   * @returns {Promise}
   */
  async function callAI(apiPack, messages, onStream) {
    // 暂时只实现了deepseek厂商的调用
    if (apiPack.vendor === "deepseek") {
      const url = apiPack.baseUrl.endsWith("/")
        ? apiPack.baseUrl + "v1/chat/completions"
        : apiPack.baseUrl + "/v1/chat/completions";
      const reqBody = {
        model: apiPack.model,
        messages,
        stream: true
      };
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiPack.apiKey}`
      };
  
      // 是否为思维链模型
      const reasoningSupport = isReasoningModel(apiPack.model);
  
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
        // 处理SSE格式
        let chunk = decoder.decode(value, {stream: true});
        // 兼容分段（如data: ...\n\n）
        chunk.split("\n").forEach(line => {
          line = line.trim();
          if (!line || !line.startsWith("data:")) return;
          // 解析数据
          const data = line.slice(5);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              const delta = parsed.choices[0].delta;
              if (reasoningSupport && delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                onStream("", delta.reasoning_content);
              } else if (delta.content) {
                fullContent += delta.content;
                onStream(delta.content, "");
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        });
      }
      return {content: fullContent, reasoning: reasoningContent};
    } else {
      throw new Error("暂未支持的AI厂商");
    }
  }
  