class CSV {
  constructor(data, keys = false) {
    this.ARRAY = Symbol('ARRAY');
    this.OBJECT = Symbol('OBJECT');

    this.data = data;

    if (CSV.isArray(data)) {
      if (0 == data.length) {
        this.dataType = this.ARRAY;
      } else if (CSV.isObject(data[0])) {
        this.dataType = this.OBJECT;
      } else if (CSV.isArray(data[0])) {
        this.dataType = this.ARRAY;
      } else {
        throw Error('Error: 未対応のデータ型です');
      }
    } else {
      throw Error('Error: 未対応のデータ型です');
    }

    this.keys = keys;
  }

  toString() {
    if (this.dataType === this.ARRAY) {
      return this.data
        .map((record) => record.map((field) => CSV.prepare(field)).join(','))
        .join('\n');
    } else if (this.dataType === this.OBJECT) {
      const keys = this.keys || Array.from(this.extractKeys(this.data));

      const arrayData = this.data.map((record) =>
        keys.map((key) => record[key])
      );

      return []
        .concat([keys], arrayData)
        .map((record) => record.map((field) => CSV.prepare(field)).join(','))
        .join('\n');
    }
  }

  save(filename = 'data.csv') {
    if (!filename.match(/\.csv$/i)) {
      filename = filename + '.csv';
    }

    const csvStr = this.toString();

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvStr], {
      type: 'text/csv'
    });
    const url = window.URL || window.webkitURL;
    const blobURL = url.createObjectURL(blob);

    let a = document.createElement('a');
    a.download = decodeURI(filename);
    a.href = blobURL;
    a.type = 'text/csv';

    a.click();
  }

  extractKeys(data) {
    return new Set(
      [].concat(...this.data.map((record) => Object.keys(record)))
    );
  }

  static prepare(field) {
    return '"' + ('' + field).replace(/"/g, '""') + '"';
  }

  static isObject(obj) {
    return '[object Object]' === Object.prototype.toString.call(obj);
  }

  static isArray(obj) {
    return '[object Array]' === Object.prototype.toString.call(obj);
  }
}

try {
  const URL = location.href;
  
  if (URL != 'https://mypage2.tetoteconnect.jp/mypage-web2/?news=1') {
    throw new Error(
      '表示しているページが違います。マイページのトップを開いて再度試してください。'
    );
  }
  
  let requestURL = 'https://mypage2.tetoteconnect.jp/mypage-web2/api/user?data=characters,stages,degrees&lang=ja_jp';
  let request = new XMLHttpRequest();
  
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  
  request.onload = function() {
    const userData = request.response;
        
    let results = [];
    let tmpResult;
    let num = [0, 0, 0, 0, 0];
    let diffNum = -1;
    let diff = "";
    
    for (let i = 0; i <= userData['response']['stages'].length - 1; i++) {
      if (userData['response']['stages'][i]['mode'] == 1) {
        diffNum = userData['response']['stages'][i]['chartId'].substring(5, 6);
        diff = makeDiff(diffNum);
        num[diffNum] += 1;
        
        tmpResult = {
          title: userData['response']['stages'][i]['stage']['label'],
          //mode: userData['response']['stages'][i]['mode'],
          difficulty: diff,
          highScore: userData['response']['stages'][i]['highScore'],
          //rank: userData['response']['stages'][i]['rankCounts'][1]['rank'],
          playCount: userData['response']['stages'][i]['playCount'],
          FCCount: userData['response']['stages'][i]['fullComboCount'],
          APCount: userData['response']['stages'][i]['perfectCount']
        };
        results.push(tmpResult);
      }
    }
    
    alert(
      `テトコネスコア集計ツール\nStandart:${num[0]}曲, Expert:${num[1]}曲, Ultimate:${num[2]}曲, Maniac:${num[3]}曲, Connect:${num[4]}曲, \nボタンを押すとCSVのダウンロードが始まります。`
    );
    new CSV(results).save('tetoconne_score.csv');
  }
} catch (e) {
  alert(e);
}

function makeDiff(chartId) {
  let diff = chartId;
  switch (diff) {
    case "0":
      diff = "Standard";
      break;
    case "1":
      diff = "Expert";
      break;
    case "2":
      diff = "Ultimate";
      break;
    case "3":
      diff = "Maniac";
      break;
    case "4":
      diff = "Connect";
      break;
  }
  return diff;
}
