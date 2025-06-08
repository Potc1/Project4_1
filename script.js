

function SetData(data, user_profile) {
    $('#collapseStonks').html(function () {
        var len = Object.keys(data).length;
        console.log(len)

        elem = ``;
        elem += `<div class="share"><b>Название</b><b>Размер лота</b><b>Цена мин</b><b>Цена макс</b></div>`
        for (let key in data['Shares']) {
            elem += `
            <div class="share">
                    <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Shares'][key]['ISIN']}"
                        onclick="event.preventDefault(); MakeChart('${data['Shares'][key]['ISIN']}', 'Shares');" role="button"
                        aria-expanded="false" aria-controls="collapseExample">${data['Shares'][key]['NAME']}
                    </a>
                    <p>${data['Shares'][key]['LOTSIZE']}</p>
                    <p>${data['Shares'][key]['LOW']}</p>
                    <p>${data['Shares'][key]['HIGH']}</p>
            </div>` +
                `<div class="collapse" id="collapseExample${data['Shares'][key]['ISIN']}">
                <div class = "card card-body">
                    <p><b>ISIN:</b> ${data['Shares'][key]['ISIN']}</p>
                    <p><b>Цена открытия:</b> ${data['Shares'][key]['OPEN']}</p>
                    <p><b>Цена сейчас:</b> ${data['Shares'][key]['LAST']}</p>
                    <p><b>МИН:</b> ${data['Shares'][key]['LOW']} <b>МАКС</b> ${data['Shares'][key]['HIGH']}</p> 
                    <p><b>Размер лота</b> ${data['Shares'][key]['LOTSIZE']} акций</p>  
                </div>
                    <div style="max-width: 100%; height: 450px; margin: auto" id="plot${data['Shares'][key]['ISIN']}" class="js-plotly-plot"></div>
                <button type="button" class="btn btn-primary btn" onclick="modal('Shares', '${user_profile}', '${data['Shares'][key]['ISIN']}', ${data['Shares'][key]['LAST']})">Добавить</button>
            </div>`
        }
        elem += `</div>`

        elem += ``;
        return elem
    })
    var elem = ``;
    $('#collapseBonds').html(function () {
        var len = Object.keys(data).length;
        elem += `<div class="share"><b>Название</b><b>Номинал</b><b>Цена мин</b><b>Цена макс</b></div>`
        for (let key in data['Bonds']) {
            elem += `
            <div class="bond">
                <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Bonds'][key]['ISIN']}" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Bonds'][key]['NAME']}</a>
                <p>${data['Bonds'][key]['LOTVALUE']}</p>
                <p>${data['Bonds'][key]['LOW']}</p>
                <p>${data['Bonds'][key]['HIGH']}</p>` +
                `</div>` +
                `<div class="collapse" id="collapseExample${data['Bonds'][key]['ISIN']}">
                <div class="card card-body">
                    <p><b>ISIN:</b> ${data['Bonds'][key]['ISIN']}</p>
                    <p><b>Цена открытия:</b> ${data['Bonds'][key]['OPEN']}</p>
                    <p><b>Цена сейчас:</b> ${data['Bonds'][key]['LAST']}</p>
                    <p><b>МИН:</b> ${data['Bonds'][key]['LOW']} <b>МАКС</b> ${data['Bonds'][key]['HIGH']}</p> 
                    <p><b>Номинал:</b> ${data['Bonds'][key]['LOTVALUE']} </p>   
                    <p><b>Доходность:</b> ${data['Bonds'][key]['YIELD']}</p>
                    <p><b>Размер купона:</b> ${data['Bonds'][key]['COUPONVALUE']}</p>
                </div> 
                <button type="button" class="btn btn-primary btn" onclick="modal('Bonds', '${user_profile}', '${data['Bonds'][key]['ISIN']}', ${data['Bonds'][key]['LAST']})">Добавить</button>
             </div>
            
            </div>`
        }
        return elem;
    })
}

function MakeChart(ISIN, type) {
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&action=chart`, {
        method: "GET"
    })
        .then(response => response.json())
        .then((data) => Plotly.newPlot(`plot${ISIN}`, data['data'], data['layout']))
    //console.log(chart)  
}
function modal(type, user, ISIN, cost) {
    var title = "Добавить бумагу";
    var input = `
    <div class="form-group">
					<label for="count">Введите количество бумаг</label>
					<input id="count" name="email" class="form-control form-control-sm" type="text">
     </div>`
    var form = `<form id="updateTaskForm" onsubmit="return false;">${input}</form>`;
    var button = `<button type="button" class="btn btn-success" onclick="InsertStonk('${type}', '${user}', '${ISIN}', ${cost})" data->Подтвердить</button>`;
    $('#commonModal .modal-header .modal-title').html(title);
    $('#commonModal .modal-body').html(form);
    $('#commonModal .modal-footer').html(button);
    $('#commonModal').modal('show');
}
function InsertStonk(type, user, ISIN, cost) {
    var count = document.getElementById('count').value;
    console.log(type, user, ISIN, cost, count);
    data = {
        type: type,
        user: user,
        ISIN: ISIN,
        cost: cost,
        count: count
    }
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&user=${user}&isin=${ISIN}&count=${count}&cost=${cost}&action=Insert`, {
        method: "GET",
    })
    $('#commonModal').modal('toggle');
}
