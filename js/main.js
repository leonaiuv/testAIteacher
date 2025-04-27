// main.js
// 页面加载入口，初始化各部分

window.onload = function() {
    // 不再渲染主区的ai-settings-section，而是弹窗
    // renderAISettings();
    renderQuizSection();
    renderReviewSection();
  
    // 弹窗按钮事件
    document.getElementById("show-settings-btn").onclick = function() {
      document.getElementById("ai-settings-modal").style.display = "block";
      renderAISettingsModal();
    };
    document.getElementById("close-settings-modal").onclick = function() {
      document.getElementById("ai-settings-modal").style.display = "none";
    };
    document.getElementById("ai-settings-modal").onclick = function(e) {
        if (e.target === this) {
          this.style.display = "none";
        }
      };
  };
  
  