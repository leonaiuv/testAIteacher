// apipacks.js
// 用于管理API包的增删查改和本地存储

const API_PACKS_KEY = "ai_api_packs";

// 获取所有API包
function getApiPacks() {
  const packs = localStorage.getItem(API_PACKS_KEY);
  return packs ? JSON.parse(packs) : [];
}

// 保存API包
function saveApiPack(pack) {
  let packs = getApiPacks();
  // 检查是否已有同名
  const idx = packs.findIndex(p => p.name === pack.name && p.vendor === pack.vendor);
  if (idx > -1) {
    packs[idx] = pack;
  } else {
    packs.push(pack);
  }
  localStorage.setItem(API_PACKS_KEY, JSON.stringify(packs));
}

// 删除API包
function deleteApiPack(name, vendor) {
  let packs = getApiPacks();
  packs = packs.filter(p => !(p.name === name && p.vendor === vendor));
  localStorage.setItem(API_PACKS_KEY, JSON.stringify(packs));
}

// 获取指定厂商的API包
function getVendorApiPacks(vendor) {
  return getApiPacks().filter(p => p.vendor === vendor);
}
