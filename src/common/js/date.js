export function formatDate(date, fmt) {
  /* const year = date.getFullYear();
  if (/(y+)/.test(fmt)) { // (y+)小括号捕获了匹配，RegExp.$1就是匹配了括号里面的值
    fmt = fmt.replace(RegExp.$1, (year + '').substr(4 - RegExp.$1.length));
    // year是个数字+''变成字符串使用它的substr方法*/
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
  };
  function* entries(obj) {
    for (const key of Object.keys(obj)) {
      yield [key, obj[key]];
    }
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const [k, val] of entries(o)) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      const tmp = RegExp.$1.length === 1 ? val : ('00' + val).substr(('' + val).length);
      fmt = fmt.replace(RegExp.$1, tmp);
    }
  }
  return fmt;
}
