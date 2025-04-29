window.onload = function() {
    renderQuizSection();
    renderReviewSection();
  
    // ========== 引导逻辑 ==========
    // 判断本地是否已有API包（或selected_api_pack），没有就弹气泡
    let apiPack = localStorage.getItem("selected_api_pack");
    if (!apiPack) {
      document.getElementById("settings-guide-tip").style.display = "block";
      document.getElementById("show-settings-btn").classList.add("guide-highlight");
    }
  
    // 显示设置按钮事件
    document.getElementById("show-settings-btn").onclick = function() {
      document.getElementById("ai-settings-modal").style.display = "block";
      renderAISettingsModal();
      // 用户点开设置后，隐藏引导
      document.getElementById("settings-guide-tip").style.display = "none";
      document.getElementById("show-settings-btn").classList.remove("guide-highlight");
      
      // 切换显示/隐藏按钮
      document.getElementById("show-settings-btn").style.display = "none";
      document.getElementById("hide-settings-btn").style.display = "block";
    };
    
    // 隐藏设置按钮事件
    document.getElementById("hide-settings-btn").onclick = function() {
      document.getElementById("ai-settings-modal").style.display = "none";
      // 切换显示/隐藏按钮
      document.getElementById("hide-settings-btn").style.display = "none";
      document.getElementById("show-settings-btn").style.display = "block";
    };
  
    document.getElementById("close-settings-modal").onclick = function() {
      document.getElementById("ai-settings-modal").style.display = "none";
      // 切换显示/隐藏按钮
      document.getElementById("hide-settings-btn").style.display = "none";
      document.getElementById("show-settings-btn").style.display = "block";
      
      // 关闭后如果仍未设置API包，提示还可显示（可选）
      let apiPack = localStorage.getItem("selected_api_pack");
      if (!apiPack) {
        document.getElementById("settings-guide-tip").style.display = "block";
        document.getElementById("show-settings-btn").classList.add("guide-highlight");
      }
    };
  };
  