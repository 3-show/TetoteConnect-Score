const header = document.querySelector('header');
const section = document.querySelector('section');

let requestURL = 'https://mypage2.tetoteconnect.jp/mypage-web2/api/user?data=degrees&lang=ja_jp';

let request = new XMLHttpRequest();

request.open('GET', requestURL);

request.responseType = 'json';
request.send();

request.onload = function() {
  const userData = request.response;
  testAlert(userData);
}

function testAlert(obj) {
  const myH1 = document.createElement('h1');
  myH1.textContent = obj['response']['name'] + ' のマイページ';
  alert(myH1);
}
