/*
解析url参数
  "?id=123&a=1&b=2/"
返回一个对象
  {id: 123, a:1, b:2}
*/
export function urlParse() {
  const url = window.location.search;
  const obj = {};
  const reg = /[?&][^?&]+=[^?&]+/g;
  const arr = url.match(reg);
  // ['?id=123', '&a=1', '&b=2']
  if (arr) {
    arr.forEach((item) => {
      const tempArr = item.substring(1).split('=');
      const key = decodeURIComponent(tempArr[0]);
      const val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
}
