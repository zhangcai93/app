export function saveToLocal(id, key, value) {
  let seller = window.localStorage.__seller__;
  if (!seller) { // 从未创建过seller
    seller = {};
    seller[id] = {}; // id标识一个商家并初始为空对象
  } else {
    seller = JSON.parse(seller);
    if (!seller[id]) { // 判断是否有该商家
      seller[id] = {};
    }
  }
  seller[id][key] = value;
  window.localStorage.__seller__ = JSON.stringify(seller);
}

 export function loadFromLocal(id, key, def) {
  let seller = window.localStorage.__seller__;
  if (!seller) { // 没有商家返回默认值
    return def;
  }
  seller = JSON.parse(seller)[id]; // 有商家解析为json对象取当前商家中所有对象
  if (!seller) { // 取不到返回默认值
    return def;
  }
  const ret = seller[key]; // 取到了，看当前商家是否有对应的这个key
  return ret || def; // 有返回key对应的值，没有返回默认值
}
