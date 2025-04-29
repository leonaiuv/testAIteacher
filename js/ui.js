// ui.js
// 渲染弹窗内容
/**
 * 渲染通用的AI设置界面
 * @param {string} sectionId - 要渲染到的section元素ID
 * @param {boolean} isModal - 是否为模态窗口渲染
 */
function renderAISettingsCommon(sectionId, isModal) {
    const section = document.getElementById(sectionId);
    const containerClass = isModal ? "settings-modal-card" : "card";
    const titleClass = isModal ? "settings-section-title" : "card-title";
    const formClass = isModal ? "form-block" : "form-group";
    const buttonClass = isModal ? "primary-btn" : "";
    const autocomplete = isModal ? " autocomplete=\"off\"" : "";
    const miniCardListClass = isModal ? " class=\"mini-card-list\"" : "";
    const selectClass = isModal ? " class=\"assistant-select\"" : "";
    
    // 构建HTML
    section.innerHTML = `
      <div class="${containerClass}">
        ${!isModal ? '<div class="card-title"><img src="img\\AI设置火花_1745931583.png" rel="settingicon" style="width:25px; height:25px;">AI 设置和助手选择</div>' : ''}
        ${!isModal ? '<div class="card-desc">配置你的AI厂商API信息，选择/自定义AI助手角色和提示词。</div>' : ''}
        ${isModal ? '<div class="settings-section-title">API厂商配置</div>' : ''}
        <form id="api-pack-form"${autocomplete}>
          <div class="${formClass}">
            <label>厂商</label>
            <select id="api-vendor">
              <option value="deepseek">deepseek</option>
              <option value="custom">其它厂商接入中..</option>
            </select>
          </div>
          <div class="${formClass}">
            <label>API Key</label>
            <input type="password" id="api-key" required placeholder="请输入API key">
          </div>
          <div class="${formClass}">
            <label>Base URL</label>
            <input type="text" id="api-baseurl" required placeholder="API Base URL">
          </div>
          <div class="${formClass}">
            <label>模型名称</label>
            <input type="text" id="api-model" required placeholder="模型名称，如 deepseek-coder">
          </div>
          <div class="${formClass}">
            <label>系统提示词${isModal ? '（可选）' : ''}</label>
            <textarea id="api-system-prompt" rows="2" placeholder="可选，覆盖默认系统提示词"></textarea>
          </div>
          <div class="${formClass}">
            <label>API包名</label>
            <input type="text" id="api-pack-name" required placeholder="自定义包名">
          </div>
          <button type="submit" class="${buttonClass}">保存API包</button>
        </form>
        ${isModal ? '<div class="mini-title">已保存API包</div>' : ''}
        <div id="api-packs-list"${miniCardListClass}></div>

        ${isModal ? '<hr class="settings-split">' : '<hr>'}

        ${isModal ? '<div class="settings-section-title">提示词助手配置</div>' : ''}
        <form id="prompt-pack-form"${autocomplete}>
          <div class="${formClass}">
            <label>提示词内容</label>
            <textarea id="prompt-pack-prompt" rows="3"></textarea>
          </div>
          <div class="${formClass}">
            <label>提示词包名</label>
            <input type="text" id="prompt-pack-name" placeholder="自定义提示词包名">
          </div>
          <button type="submit" class="${buttonClass}">保存${isModal ? '' : '自定义'}提示词包</button>
        </form>
        ${isModal ? '<div class="mini-title">已保存提示词包</div>' : ''}
        <div id="prompt-packs-list"${miniCardListClass}></div>

        ${isModal ? 
          '<div class="settings-section-title" style="margin-top:20px;">选择AI助手/提示词包</div>' : 
          '<div class="select-assistant"><label>选择AI助手/提示词包</label></div>'
        }
        <select id="assistant-select"${selectClass}></select>
      </div>
    `;
    
    // 渲染列表和设置事件监听
    renderApiPacksList();
    renderPromptPacksList(); // 添加这一行！
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
      // 保存后隐藏引导
      //document.getElementById("settings-guide-tip").style.display = "none";
      //document.getElementById("show-settings-btn").classList.remove("guide-highlight");

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
      renderPromptPacksList(); // 添加这一行，确保保存后刷新列表
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

/**
 * 渲染主页面中的AI设置
 */
function renderAISettings() {
  renderAISettingsCommon("ai-settings-section", false);
}
  
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

/**
 * 渲染主页面中的AI设置
 */
function renderAISettings() {
  renderAISettingsCommon("ai-settings-section", false);
}
  
function renderApiPacksList() {
    const listDiv = document.getElementById("api-packs-list");
    const packs = getApiPacks();
    listDiv.innerHTML = "";
    if (packs.length === 0) {
      listDiv.innerHTML = "<div style='color:#aaa;font-size:.98em;padding:6px 0;'>暂无API包</div>";
      return;
    }
    packs.forEach((p, i) => {
      const selected = localStorage.getItem("selected_api_pack");
      const isSel = selected && JSON.parse(selected).name === p.name;
      listDiv.innerHTML += `
        <div class="mini-card${isSel ? " selected":""}">
          <span class="mini-card-name">🔑 ${p.vendor} - ${p.name} <span style="font-size:92%;color:#888;">(${p.model})</span></span>
          <button class="mini-btn${isSel ? " selected":""}" onclick="onSelectApiPack(${i})"><i>✓</i>选用</button>
          <button class="mini-btn delete" onclick="onDeleteApiPack('${p.name}','${p.vendor}')"><i>🗑</i>删除</button>
        </div>
      `;
    });
  }
  function renderPromptPacksList() {
    const listDiv = document.getElementById("prompt-packs-list");
    const packs = getPromptPacks();
    listDiv.innerHTML = "";
    packs.forEach((p, i) => {
        // 获取当前选中的提示词包名称
        const selectedPackName = localStorage.getItem("selected_prompt_pack");
        // 判断当前包是否为选中状态
        const isSel = selectedPackName && p.name === selectedPackName;
        listDiv.innerHTML += `
            <div class="mini-card${isSel ? " selected" : ""}">
                <span class="mini-card-name">💡${p.name}</span>
                <button class="mini-btn${isSel ? " selected" : ""}" onclick="onSelectPromptPack(${i})"><i>✓</i>选用</button>
                <button class="mini-btn delete" onclick="onDeletePromptPack('${p.name}')"><i>🗑</i>删除</button>
            </div>
        `;
    });
}
function onSelectPromptPack(index) {
  const packs = getPromptPacks();
  const selectedPack = packs[index];
  // 将选中的提示词包名称存储到localStorage中
  localStorage.setItem("selected_prompt_pack", selectedPack.name);
  renderPromptPacksList(); // 重新渲染列表以更新选中状态
  renderAssistantSelect(); // 更新下拉框选择
}

function onDeletePromptPack(name) {
  if (!confirm(`确定要删除提示词包"${name}"吗？`)) return;
  deletePromptPack(name);
  // 如果删除的是当前选中的包，清除选中状态
  const selectedPackName = localStorage.getItem("selected_prompt_pack");
  if (selectedPackName === name) {
      localStorage.removeItem("selected_prompt_pack");
  }
  renderPromptPacksList(); // 删除后重新渲染列表
  renderAssistantSelect(); // 更新选择下拉框
}
  
  function onSelectApiPack(idx) {
    const packs = getApiPacks();
    const pack = packs[idx];
    localStorage.setItem("selected_api_pack", JSON.stringify(pack));
    renderApiPacksList();
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
        // 获取当前选中的提示词包名称
        const selectedPackName = localStorage.getItem("selected_prompt_pack");
        // 查找对应的索引
        const selectedIndex = packs.findIndex(p => p.name === selectedPackName);
        // 如果找到对应项，设置选中状态
        if (selectedIndex !== -1) {
            select.selectedIndex = selectedIndex;
            document.getElementById("prompt-pack-prompt").value = packs[selectedIndex].systemPrompt;
            document.getElementById("prompt-pack-name").value = packs[selectedIndex].name;
        } else {
            // 默认选中第一个
            select.selectedIndex = 0;
            document.getElementById("prompt-pack-prompt").value = packs[0].systemPrompt;
            document.getElementById("prompt-pack-name").value = packs[0].name;
        }
    }
}
  
  /* ====== 第二部分：出题 ====== */
  function renderQuizSection() {
    const section = document.getElementById("quiz-section");
    section.innerHTML = `
      <div class="card">
        <div class="card-title"><img src="img\\闪耀的笔_1745902904.png" style="width: 25px; height: 25px;">出题</div>
        <div class="card-desc">输入你今天学习的内容，AI老师会自动生成针对你的题目。</div>
        <div class="form-group" style="margin-bottom:12px;">
          <label>知识点</label>
          <textarea id="user-knowledge" rows="2" placeholder="如：数组的声明、push方法、数组长度等" spellcheck="false"></textarea>
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
          <textarea class="code-block quiz-answer" id="answer-${idx}" placeholder="请在这里输入你的代码" spellcheck="false" style="height: 250px;"></textarea>
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
    const qStart = line =>
      /^(\s*(\/\/|#))?\s*题目\s*\d+/.test(line) || /^(\s*(\/\/|#))?\s*第\s*\d+\s*题/.test(line);
  
    lines.forEach(ln => {
      if (qStart(ln)) {
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
        <div class="card-title"><img src="img\\检查图标_1745901233.png" rel="icon" style="width:30px; height:30px;">批改与反馈
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
  