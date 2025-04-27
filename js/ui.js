// ui.js
// 负责所有界面的渲染和交互逻辑

/**
 * 渲染AI设置和助手选择区域
 */
function renderAISettings() {
    const section = document.getElementById("ai-settings-section");
    section.innerHTML = "";
    section.innerHTML = `
      <h2>AI设置与助手选择</h2>
      <div class="flex-row">
        <div class="flex-col" id="api-pack-form-wrap">
          <form id="api-pack-form">
            <label>厂商 (vendor)：</label>
            <select id="api-vendor">
              <option value="deepseek">deepseek</option>
            </select>
  
            <label>API Key：</label>
            <input type="password" id="api-key" required placeholder="请输入API key">
  
            <label>Base URL：</label>
            <input type="text" id="api-baseurl" required placeholder="API Base URL">
  
            <label>模型名称：</label>
            <input type="text" id="api-model" required placeholder="模型名称，如 deepseek-coder">
  
            <label>系统提示词（可选）：</label>
            <textarea id="api-system-prompt" rows="2" placeholder="可选，覆盖默认系统提示词"></textarea>
  
            <label>API包名称：</label>
            <input type="text" id="api-pack-name" required placeholder="自定义包名">
  
            <button type="submit">保存API包</button>
          </form>
          <div id="api-packs-list"></div>
        </div>
        <div class="flex-col" id="prompt-pack-form-wrap">
          <form id="prompt-pack-form">
            <label>自定义提示词（系统提示词）：</label>
            <textarea id="prompt-pack-prompt" rows="4"></textarea>
  
            <label>提示词包名称：</label>
            <input type="text" id="prompt-pack-name" placeholder="自定义提示词包名">
  
            <button type="submit">保存自定义提示词包</button>
          </form>
          <div class="select-assistant">
            <label>选择AI助手/提示词包：</label>
            <select id="assistant-select"></select>
          </div>
        </div>
      </div>
    `;
  
    // 渲染API包列表
    renderApiPacksList();
  
    // 渲染助手下拉
    renderAssistantSelect();
  
    // 表单事件
    document.getElementById("api-pack-form").onsubmit = function(e) {
      e.preventDefault();
      const pack = {
        vendor: document.getElementById("api-vendor").value,
        apiKey: document.getElementById("api-key").value,
        baseUrl: document.getElementById("api-baseurl").value,
        model: document.getElementById("api-model").value,
        systemPrompt: document.getElementById("api-system-prompt").value,
        name: document.getElementById("api-pack-name").value
      };
      saveApiPack(pack);
      renderApiPacksList();
      alert("API包已保存！");
    };
  
    document.getElementById("prompt-pack-form").onsubmit = function(e) {
      e.preventDefault();
      const pack = {
        name: document.getElementById("prompt-pack-name").value,
        systemPrompt: document.getElementById("prompt-pack-prompt").value
      };
      if (!pack.name) {
        alert("请填写提示词包名称");
        return;
      }
      savePromptPack(pack);
      renderAssistantSelect();
      alert("自定义提示词包已保存！");
    };
  
    // 助手包切换
    document.getElementById("assistant-select").onchange = function() {
      // 显示系统提示词内容
      const packs = getPromptPacks();
      const selIdx = this.selectedIndex;
      const pack = packs[selIdx];
      document.getElementById("prompt-pack-prompt").value = pack.systemPrompt;
      document.getElementById("prompt-pack-name").value = pack.name;
    };
  }
  
  function renderApiPacksList() {
    const listDiv = document.getElementById("api-packs-list");
    const packs = getApiPacks();
    if (packs.length === 0) {
      listDiv.innerHTML = "<p>暂无API包，填写左侧表单保存。</p>";
      return;
    }
    listDiv.innerHTML = `<h4>已保存API包：</h4>`;
    packs.forEach((p, i) => {
      listDiv.innerHTML += `
        <div style="margin-bottom:6px;">
          <b>${p.vendor} - ${p.name} (${p.model})</b>
          <button onclick="onSelectApiPack(${i})">选用</button>
          <button onclick="onDeleteApiPack('${p.name}','${p.vendor}')">删除</button>
        </div>
      `;
    });
  }
  
  // 选中API包用于会话
  function onSelectApiPack(idx) {
    const packs = getApiPacks();
    const pack = packs[idx];
    // 存储到本地
    localStorage.setItem("selected_api_pack", JSON.stringify(pack));
    alert(`已选择API包: ${pack.name}`);
  }
  
  // 删除API包
  function onDeleteApiPack(name, vendor) {
    if (!confirm("确定要删除该API包吗？")) return;
    deleteApiPack(name, vendor);
    renderApiPacksList();
  }
  
  // 渲染助手包选择
  function renderAssistantSelect() {
    const select = document.getElementById("assistant-select");
    const packs = getPromptPacks();
    select.innerHTML = "";
    packs.forEach((p, idx) => {
      select.innerHTML += `<option value="${idx}">${p.name}</option>`;
    });
    // 默认展示第一个
    if (packs.length) {
      document.getElementById("prompt-pack-prompt").value = packs[0].systemPrompt;
      document.getElementById("prompt-pack-name").value = packs[0].name;
    }
  }
  
  // ====== 第二部分：出题 ======
  function renderQuizSection() {
    const section = document.getElementById("quiz-section");
    section.innerHTML = `
      <h2>2. 请输入今天学习的知识点，让AI出题老师帮你出题</h2>
      <textarea id="user-knowledge" rows="3" placeholder="输入你今天学的知识点，比如：数组的声明、push方法、数组长度等"></textarea>
      <button id="generate-quiz-btn">让AI出题</button>
      <div id="quiz-questions-block"></div>
    `;
  
    document.getElementById("generate-quiz-btn").onclick = async function() {
      const knowledge = document.getElementById("user-knowledge").value.trim();
      if (!knowledge) {
        alert("请填写你的知识点");
        return;
      }
      await generateQuizQuestions(knowledge);
    };
  }
  
  // 出题并渲染题目
  async function generateQuizQuestions(knowledge) {
    const quizDiv = document.getElementById("quiz-questions-block");
    quizDiv.innerHTML = `<div class="stream-output">正在生成题目...</div>`;
  
    // 获取当前API包、系统提示词
    const apiPack = getSelectedApiPack();
    if (!apiPack) {
      quizDiv.innerHTML = `<span style="color:red;">请先在上方选择API包</span>`;
      return;
    }
    const promptPack = getSelectedPromptPack();
  
    // 组装messages
    const systemPrompt = apiPack.systemPrompt || promptPack.systemPrompt;
    const messages = [
      {role: "system", content: systemPrompt},
      {role: "user", content: knowledge}
    ];
  
    let aiOutput = "";
    let reasoning = "";
  
    await callAI(apiPack, messages, (chunk, rchunk) => {
      if (rchunk) {
        reasoning += rchunk;
        quizDiv.innerHTML = `<div class="stream-output">${reasoning}</div>`;
      } else {
        aiOutput += chunk;
        quizDiv.innerHTML = `<div class="stream-output">${aiOutput}</div>`;
      }
    });
  
    // 解析题目，生成代码编辑框
    const questions = parseQuizQuestions(aiOutput || reasoning);
    quizDiv.innerHTML = "";
    questions.forEach((q, idx) => {
      quizDiv.innerHTML += `
        <div style="margin-bottom:10px;">
          <div style="margin-bottom:4px;"><b>题目${idx+1}：</b></div>
          <div class="code-block" style="background:#f7f7f9;color:#222;">${q}</div>
          <textarea class="code-block" id="answer-${idx}" placeholder="请在这里输入你的代码"></textarea>
        </div>
      `;
    });
    quizDiv.innerHTML += `<button id="submit-answers-btn">提交答案并批改</button>`;
  
    document.getElementById("submit-answers-btn").onclick = function() {
      submitAnswers(questions);
    };
  }
  
  // 解析AI输出成题目数组（简单根据 // 题目N: 分割）
  function parseQuizQuestions(aiOutput) {
    const lines = aiOutput.split(/\r?\n/);
    let questions = [];
    let curr = [];
    lines.forEach(ln => {
      if (/^\/\/\s*题目\d+/.test(ln)) {
        if (curr.length) questions.push(curr.join('\n'));
        curr = [ln];
      } else {
        curr.push(ln);
      }
    });
    if (curr.length) questions.push(curr.join('\n'));
    // 去掉空题
    return questions.map(q => q.trim()).filter(q => q.length > 0);
  }
  
  // 获取当前选择的API包和提示词包
  function getSelectedApiPack() {
    const pack = localStorage.getItem("selected_api_pack");
    return pack ? JSON.parse(pack) : null;
  }
  function getSelectedPromptPack() {
    const sel = document.getElementById("assistant-select");
    const idx = sel ? sel.selectedIndex : 0;
    const packs = getPromptPacks();
    return packs[idx] || packs[0];
  }
  
  // ====== 第三部分：批改与审阅 ======
  function renderReviewSection() {
    const section = document.getElementById("review-section");
    section.innerHTML = `
      <h2>3. 批改与反馈</h2>
      <div id="review-output-block"></div>
    `;
  }
  
  // 提交答案给AI批改
  async function submitAnswers(questions) {
    // 收集答案
    const answers = [];
    for (let i=0; i<questions.length; i++) {
      const v = document.getElementById(`answer-${i}`).value;
      answers.push({question: questions[i], answer: v});
    }
    // 组装消息
    let userContent = "";
    for (let i=0; i<answers.length; i++) {
      userContent += `// 题目${i+1}:\n${answers[i].question}\n// 我的答案:\n${answers[i].answer}\n\n`;
    }
  
    const apiPack = getSelectedApiPack();
    if (!apiPack) {
      alert("请先选择API包");
      return;
    }
    const promptPack = getSelectedPromptPack();
    const systemPrompt = apiPack.systemPrompt || promptPack.systemPrompt;
  
    const messages = [
      {role: "system", content: systemPrompt},
      {role: "user", content: userContent}
    ];
  
    // 输出到审阅区
    const reviewDiv = document.getElementById("review-output-block");
    reviewDiv.innerHTML = `<div class="stream-output">正在批改...</div>`;
  
    let aiOutput = "";
    let reasoning = "";
  
    await callAI(apiPack, messages, (chunk, rchunk) => {
      if (rchunk) {
        reasoning += rchunk;
        reviewDiv.innerHTML = `<div class="stream-output">${reasoning}</div>`;
      } else {
        aiOutput += chunk;
        reviewDiv.innerHTML = `<div class="stream-output">${aiOutput}</div>`;
      }
    });
  }
  