// promptpacks.js
// 管理系统提示词包和用户自定义的提示词包

const PROMPT_PACKS_KEY = "ai_prompt_packs";

// 默认出题老师和批改老师提示词
const defaultPrompts = [
  {
    name: "AI出题老师",
    systemPrompt: `你有两个可选角色，只能根据用户的问题判断选择哪一个角色执行。除此之外不回答任何任务之外的问题。

## 角色1：出题老师

请仅根据用户提供的知识点，出3个题目，请不要超纲.因为用户是新手，正在学习这些知识点，必须是这些知识点的练习，以方便用户建立学习自信和实操记忆。
出题格式举例：
// 题目1：如下
// 任务1：声明一个空数组colors
// 任务2：用push方法添加"红"、"绿"、"蓝"三个颜色
// 任务3：打印数组长度到控制台
// 任务4：取出最后一个颜色并赋值给变量lastColor
// 任务5：打印lastColor的值

// 题目2：如下
// 任务1：声明一个空数组colors
// 任务2：用push方法添加"红"、"绿"、"蓝"三个颜色
// 任务3：打印数组长度到控制台
// 任务4：取出最后一个颜色并赋值给变量lastColor
// 任务5：打印lastColor的值

// 题目3：如下

// 任务1：声明一个空数组colors
// 任务2：用push方法添加"红"、"绿"、"蓝"三个颜色
// 任务3：打印数组长度到控制台
// 任务4：取出最后一个颜色并赋值给变量lastColor
// 任务5：打印lastColor的值

### 限制：不能给参考示例，只需要按照格式出题即可。
### 限制：绝对不能输出和格式无关的内容，任何解释性说明都不能输出。

## 角色2：批改作业老师

根据用户提供的答案判断是否正确或者错误，如果有错误需要给出正确写法和对应知识点的记忆方法和用法

`,
    readonly: true
  }
];

// 获取所有提示词包
function getPromptPacks() {
  const packs = localStorage.getItem(PROMPT_PACKS_KEY);
  if (!packs) return [...defaultPrompts];
  const arr = JSON.parse(packs);
  // 合并默认包
  return [...defaultPrompts, ...arr.filter(p => !p.readonly)];
}

// 保存自定义提示词包
function savePromptPack(pack) {
  // 自定义包
  let packs = localStorage.getItem(PROMPT_PACKS_KEY);
  packs = packs ? JSON.parse(packs) : [];
  // 检查是否同名
  const idx = packs.findIndex(p => p.name === pack.name);
  if (idx > -1) {
    packs[idx] = pack;
  } else {
    packs.push(pack);
  }
  localStorage.setItem(PROMPT_PACKS_KEY, JSON.stringify(packs));
}

// 删除自定义提示词包
function deletePromptPack(name) {
  let packs = localStorage.getItem(PROMPT_PACKS_KEY);
  packs = packs ? JSON.parse(packs) : [];
  packs = packs.filter(p => p.name !== name);
  localStorage.setItem(PROMPT_PACKS_KEY, JSON.stringify(packs));
}
