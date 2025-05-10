function SetData(data){
    $('#sharesContent').html(function(){
        var len = Object.keys(data).length;
        console.log(len)
   
        elem = ``;
        elem += `<div id="collapseStonks" class="collapse">` +
        `<table class="table text-center table-hover"><thead><tr><th>Название</th><th>Размер лота</th><th>Цена мин</th><th>Цена макс</th></thead></table>`
        for(let key in data['Shares']){
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
                    <b>ISIN:</b> ${data['Shares'][key]['ISIN']} <br> <b>OPEN:</b> ${data['Shares'][key]['OPEN']} LOW: ${data['Shares'][key]['LOW']} <br> <b>LAST:</b> ${data['Shares'][key]['LAST']} HIGH: ${data['Shares'][key]['HIGH']} 
                </div>
                    <div style="max-width: 100%; height: 450px; margin: auto" id="plot${data['Shares'][key]['ISIN']}" class="js-plotly-plot"></div>
                <button type="button" class="btn btn-primary btn" onclick="modal('Shares', 'user', '${data['Shares'][key]['ISIN']}', ${data['Shares'][key]['LAST']})">Добавить</button>
            </div>`             
        }
        elem += `</div>`

        elem += ``;
        return elem
    })
    $('#bondsContent').html(function(){
        var len = Object.keys(data).length;
        elem += `<div id="collapseBonds" class="collapse">` +
        `<table class="table text-center table-hover"><thead><tr><th>Название</th><th>Размер лота</th><th>Цена мин</th><th>Цена макс</th></thead></table>`
        for(let key in data['Bonds']){
            elem += `
            <div class="bond">
                <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Bonds'][key]['ISIN']}" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Bonds'][key]['NAME']}</a>
                <p>${data['Bonds'][key]['OPEN']}</p>
                <p>${data['Bonds'][key]['OPEN']}</p>
                <p>${data['Bonds'][key]['OPEN']}</p>` +
            `</div>` +
            `<div class="collapse" id="collapseExample${data['Bonds'][key]['ISIN']}">
                <div class="card card-body">
                    ISIN: ${data['Bonds'][key]['ISIN']} <br> <br> OPEN: ${data['Bonds'][key]['OPEN']} <br> LAST: ${data['Bonds'][key]['LAST']}  
                </div> 
             </div>` 
        }
        elem += `</div>`
        return elem;
    })
}

function MakeChart(ISIN, type){
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&action=chart`, {
        method : "GET"
    })
    .then(response => response.json())
    .then((data) =>  Plotly.newPlot(`plot${ISIN}`, data['data'], data['layout']))
    //console.log(chart)  
}
function modal(type, user, ISIN, cost){
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
function InsertStonk(type, user, ISIN, cost){
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
        method : "GET",
    })
    $('#commonModal').modal('toggle');
}