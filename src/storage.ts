export function load<T>(key:string,fallback:T):T {try{const v=localStorage.getItem('apex:'+key);return v?JSON.parse(v):fallback;}catch{return fallback;}}
export function save(key:string,value:unknown){try{localStorage.setItem('apex:'+key,JSON.stringify(value));return true;}catch{return false;}}
