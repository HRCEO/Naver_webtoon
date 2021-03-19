let request = require('request'); // var , let 사용 권장
let cheerio = require('cheerio');
let fs = require('fs'); 

const downloadImage = (path, url,titleId, no, retryCount) => // 각각의 url에서 다운하는 받아 주는 함수
{
    request(
        {
             url : url, 
             headers : {'referer' : `https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${no}&weekday=sat`},
             encoding : null
        },function(error, response, body) 
        {
             console.error('error:', error); 
             if(error && --retryCount >=0) {
                console.log(`재시도 ${titleId}_${no}_${retryCount}`)
                downloadImage (path, url,titleId, no, retryCount);
                return;
             }
             console.log('statusCode:', response && response.statusCode);

            var tmpStrPath = path + '\\' + `${titleId}_${no}_${(url.split('_IMAG')[1])}`;

            if(!fs.existsSync(path)){
                fs.mkdirSync(path);
            }

             fs.writeFile(tmpStrPath, body, null, (err) =>  // 원본 이미지 경로에서 IMAGE 부분을 찾고, 뒤쪽을 이름으로 지정합니다. (앞쪽은 배열 [0])
             {
                  if (err) throw err;
                  console.log('The file has been saved!');
             });
        });
}

const getTimageUrls =(titleId, no, NID_ADU, NID_SES) =>{ 

    let j = request.jar()
    let cookie_ADU = request.cookie(`NID_AUT=${NID_ADU}`);
    let cookie_SES = request.cookie(`NID_SES=${NID_SES}`);
    let url = 'https://comic.naver.com';
    j.setCookie(cookie_ADU, url);
    j.setCookie(cookie_SES, url);

 
    request( {url: `https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${no}&weekday=sat`, jar: j}, function (error, response, body)
    {
        const $ = cheerio.load(body);
        for(let i=0; i<$('.wt_viewer img').length; i++)
        downloadImage("download\\" + no, $('.wt_viewer img')[i].attribs.src, titleId, no, 5);
    });
}

let NID_ADU = 'DvaQQssZMN3k55oW6vezPn7g3lx1oly9SoRCeUAyoGti4JMUucn/QJqDHU/9A+9H';
let NID_SES = 'AAABi7XGF/GL0uZ2KRM+AtqoA3nwhN7Rr3VOB5dk4/nQkDZMklHv+ztstUEtweWt5F+UXXVAZaol3etFwcVE5DzeeHkKRiXmQtisEcxfDWmrZJufKHS27yvJV7D2fk2+5HYMbRPSpg/PHcaakq1L6zbHo432lgvo6ZtYSOXTL24EqhRi++a3ZlbAkic62IAAupDEgCBXXcE+kz8EC0i4W0H0BWBraHLrriS6pa82viALFAu72eRideuHHJCYKL82aqc8Vr6eax/y9ZBQ0xZU/433cl+iE0CR+gTAu3/UOHll3w7x0LdXthF1EEfx7gJfw8fRnMqtsByRjNOb+bpkvPxhKnMZOXkW/buBVKxNIndNYcwVKZhqTx5coV3a4J5N2gwrZ/RhdH0rBY8cqqGJz28duEIXz4ZmRCN2EcGMkjZweDEmg+8opRPSPX9nK7PNnVFpSnvLG5KzcWZaCtGayq7ySooY8JnSqGBHHIosngnjbQk+fIsPpfPErp1NehgNrKQ5QM53xFhdiv/x+vIMV02MSJA=';

for(let i= 1, j=169; i<512; i++, j++)
{
    setTimeout(() => {
        getTimageUrls(651673,i, NID_ADU, NID_SES);  // 웹툰의 번호는 고정, 뒤의 화수만 변경
    }, j*1000);
}