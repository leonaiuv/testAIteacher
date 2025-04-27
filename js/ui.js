// ui.js

function showProgressBar() {
    const bar = document.getElementById("progress-bar");
    bar.style.display = "block";
    bar.style.width = "10vw";
    bar.style.animation = "loading-bar 2s infinite linear";
  }
  function hideProgressBar() {
    const bar = document.getElementById("progress-bar");
    bar.style.animation = "";
    bar.style.width = "100vw";
    setTimeout(() => {
      bar.style.display = "none";
      bar.style.width = "0";
    }, 300);
  }
  
  function renderAISettings() {
    const section = document.getElementById("ai-settings-section");
    section.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">⚙️</span>AI 设置和助手选择</div>
        <div class="card-desc">配置你的AI厂商API信息，选择/自定义AI助手角色和提示词。</div>
        <form id="api-pack-form">
          <div class="form-group">
            <label>厂商</label>
            <select id="api-vendor"><option value="deepseek">deepseek</option></select>
          </div>
          <div class="form-group">
            <label>API Key</label>
            <input type="password" id="api-key" required placeholder="请输入API key">
          </div>
          <div class="form-group">
            <label>Base URL</label>
            <input type="text" id="api-baseurl" required placeholder="API Base URL">
          </div>
          <div class="form-group">
            <label>模型名称</label>
            <input type="text" id="api-model" required placeholder="模型名称，如 deepseek-coder">
          </div>
          <div class="form-group">
            <label>系统提示词</label>
            <textarea id="api-system-prompt" rows="2" placeholder="可选，覆盖默认系统提示词"></textarea>
          </div>
          <div class="form-group">
            <label>API包名</label>
            <input type="text" id="api-pack-name" required placeholder="自定义包名">
          </div>
          <button type="submit">保存API包</button>
        </form>
        <div id="api-packs-list"></div>
        <hr>
        <form id="prompt-pack-form">
          <div class="form-group">
            <label>提示词内容</label>
            <textarea id="prompt-pack-prompt" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>提示词包名</label>
            <input type="text" id="prompt-pack-name" placeholder="自定义提示词包名">
          </div>
          <button type="submit">保存自定义提示词包</button>
        </form>
        <div class="select-assistant">
          <label>选择AI助手/提示词包</label>
          <select id="assistant-select"></select>
        </div>
      </div>
    `;
    renderApiPacksList();
    renderAssistantSelect();
  
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
  
    document.getElementById("assistant-select").onchange = function() {
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
      listDiv.innerHTML = "<div class='card-desc' style='margin-top:10px;'>暂无API包，填写上方表单保存。</div>";
      return;
    }
    listDiv.innerHTML = `<div style="margin:6px 0 3px 0;font-weight:500;color:#347cfb;">已保存API包：</div>`;
    packs.forEach((p, i) => {
      listDiv.innerHTML += `
        <div class="api-pack-card">
          <b>🔑 ${p.vendor} - ${p.name} (${p.model})</b>
          <button onclick="onSelectApiPack(${i})">选用</button>
          <button onclick="onDeleteApiPack('${p.name}','${p.vendor}')">删除</button>
        </div>
      `;
    });
  }
  
  function onSelectApiPack(idx) {
    const packs = getApiPacks();
    const pack = packs[idx];
    localStorage.setItem("selected_api_pack", JSON.stringify(pack));
    alert(`已选择API包: ${pack.name}`);
  }
  function onDeleteApiPack(name, vendor) {
    if (!confirm("确定要删除该API包吗？")) return;
    deleteApiPack(name, vendor);
    renderApiPacksList();
  }
  
  function renderAssistantSelect() {
    const select = document.getElementById("assistant-select");
    const packs = getPromptPacks();
    select.innerHTML = "";
    packs.forEach((p, idx) => {
      select.innerHTML += `<option value="${idx}">${p.name}</option>`;
    });
    if (packs.length) {
      document.getElementById("prompt-pack-prompt").value = packs[0].systemPrompt;
      document.getElementById("prompt-pack-name").value = packs[0].name;
    }
  }
  
  /* ====== 第二部分：出题 ====== */
  function renderQuizSection() {
    const section = document.getElementById("quiz-section");
    section.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">📋</span>出题</div>
        <div class="card-desc">输入你今天学习的内容，AI老师会自动生成针对你的题目。</div>
        <div class="form-group" style="margin-bottom:12px;">
          <label>知识点</label>
          <textarea id="user-knowledge" rows="2" placeholder="如：数组的声明、push方法、数组长度等"></textarea>
        </div>
        <button id="generate-quiz-btn" style="margin-top:5px;">生成题目</button>
        <div id="quiz-questions-block" class="quiz-questions-list"></div>
      </div>
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
    showProgressBar();
    quizDiv.innerHTML = `<div class="stream-output">正在生成题目...</div>`;
  
    const apiPack = getSelectedApiPack();
    if (!apiPack) {
      quizDiv.innerHTML = `<span style="color:red;">请先在左侧选择API包</span>`;
      hideProgressBar();
      return;
    }
    const promptPack = getSelectedPromptPack();
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
    hideProgressBar();
  
    // 解析题目，生成代码编辑框
    const questions = parseQuizQuestions(aiOutput || reasoning);
    quizDiv.innerHTML = "";
    questions.forEach((q, idx) => {
      // 优化题目显示：分离题目和任务
      let [titleLine, ...tasks] = q.split(/\r?\n/);
      let tasksHtml = tasks.map(line => `<div style="margin-left:10px;">${line.replace(/^(\s*\/\/\s*)/,'')}</div>`).join('');
      quizDiv.innerHTML += `
        <div class="quiz-question-card">
          <div class="quiz-question-title">📝 ${titleLine.replace(/^(\s*\/\/\s*)/,'')}</div>
          <div class="code-block-view">${tasksHtml}</div>
          <textarea class="code-block quiz-answer" id="answer-${idx}" placeholder="请在这里输入你的代码"></textarea>
        </div>
      `;
    });
    quizDiv.innerHTML += `<button id="submit-answers-btn" style="margin:4px 0 6px 0;">提交答案并批改</button>`;
  
    document.getElementById("submit-answers-btn").onclick = function() {
      submitAnswers(questions);
    };
  }
  
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
    return questions.map(q => q.trim()).filter(q => q.length > 0);
  }
  
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
  
  /* ====== 第三部分：批改与审阅 ====== */
  function renderReviewSection() {
    const section = document.getElementById("review-section");
    section.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="icon">🧐</span>批改与反馈
          <button id="clear-review-btn" title="清空批改结果">清空</button>
        </div>
        <div class="card-desc">提交你的答案后，AI老师会帮你批改并给出建议。</div>
        <div id="review-output-block"></div>
      </div>
    `;
    document.getElementById("clear-review-btn").onclick = function(){
      document.getElementById("review-output-block").innerHTML = "";
    };
  }
  
  async function submitAnswers(questions) {
    const answers = [];
    for (let i=0; i<questions.length; i++) {
      const v = document.getElementById(`answer-${i}`).value;
      answers.push({question: questions[i], answer: v});
    }
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
  
    const reviewDiv = document.getElementById("review-output-block");
    showProgressBar();
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
    hideProgressBar();
  }
  