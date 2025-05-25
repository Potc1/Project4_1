let marketdata = 0

async function SetProfile(data, user_profile) {
    profile = await GetProfile(user_profile)
    var elem = ``;
    var profileCost = 0;
    var profileBeginPrice = 0;
    var profile_percent = 0;
    $('#sharesContent').html( function () {
        `<div class="share><b>Название</b><b>Цена сейчас</b><b>Цена покупки</b><b>Цена мин</b><b>Цена макс</b>"`
        marketdata = data
        var len = Object.keys(marketdata).length;
        console.log(len, marketdata)
        console.log(profile)
        elem += `<div id="collapseStonks" class="collapse">` +
            `<div class="share"><b>Название</b><b>Цена сейчас</b><b>Цена покупки</b><b>Цена мин</b><b>Цена макс</b></div>`
        for (let key in profile['liked_shares']) {
            elem += `
            <div class="share">
                    <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Shares'][key]['ISIN']}"
                        onclick="event.preventDefault(); MakeChart('${data['Shares'][key]['ISIN']}', 'Shares');" role="button"
                        aria-expanded="false" aria-controls="collapseExample">${data['Shares'][key]['NAME']}
                    </a>
                    <p>${data['Shares'][key]['LAST']*data['Shares'][key]['LOTSIZE']*profile['liked_shares'][key]['count']}</p> 
                    <p>${profile['liked_shares'][key]['likedCost']*data['Shares'][key]['LOTSIZE']*profile['liked_shares'][key]['count']}</p> 
                    <p>${data['Shares'][key]['LOW']}</p>
                    <p>${data['Shares'][key]['HIGH']}</p>
            </div>` +
                `<div class="collapse" id="collapseExample${data['Shares'][key]['ISIN']}">
                <div class = "card card-body">
                    <p><b>ISIN:</b> ${data['Shares'][key]['ISIN']}</p>
                    <p><b>Количество лотов:</b> ${profile['liked_shares'][key]['count']}</p>
                    <p><b>Цена покупки:</b> ${profile['liked_shares'][key]['likedCost']}₽</p>
                    <p><b>Цена открытия:</b> ${data['Shares'][key]['OPEN']}₽</p>
                    <p><b>Цена сейчас:</b> ${data['Shares'][key]['LAST']}₽</p>
                    <p><b>МИН:</b> ${data['Shares'][key]['LOW']}₽ <b>МАКС</b> ${data['Shares'][key]['HIGH']}₽</p> 
                    <p><b>Размер лота</b> ${data['Shares'][key]['LOTSIZE']} акций</p>  
                    <div id="note${data['Shares'][key]['ISIN']}">
                        <p><b>Заметка:</b></p>
                        <p>${(profile['liked_shares'][key]['note'] ? profile['liked_shares'][key]['note'] : "")}</p>
                    </div>
                </div>
                    <div style="max-width: 100%; height: 450px; margin: auto" id="plot${data['Shares'][key]['ISIN']}" class="js-plotly-plot"></div>
                <button type="button" class="btn btn-primary btn" onclick="modal('Shares', '${user_profile}', '${data['Shares'][key]['ISIN']}', ${data['Shares'][key]['LAST']})">Изменить</button>
                <button type="button" class="btn btn-primary btn" onclick="NoteModal('${user_profile}', '${data['Shares'][key]['ISIN']}', 'Shares')">Заметка</button>
            </div>`
            profileCost += data['Shares'][key]['LAST'] * data['Shares'][key]['LOTSIZE'] * profile['liked_shares'][key]['count']
            profileBeginPrice += profile['liked_shares'][key]['likedCost'] * data['Shares'][key]['LOTSIZE'] * profile['liked_shares'][key]['count']  // Стоимость портфеля на момент добавления
        }
        elem += `</div>`
         // доходность за все время
        elem += ``;
        return elem
    })
    elem = ``;
    $('#bondsContent').html(function () {
        var len = Object.keys(data).length;
        elem += `<div id="collapseBonds" class="collapse">` +
            `<div class="share"><b>Название</b><b>Номинал</b><b>Цена мин</b><b>Цена макс</b><b>Доходность</b></div>`
            for (let key in profile['liked_bonds'])  {
            elem += `
            <div class="bond">
                <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Bonds'][key]['ISIN']}" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Bonds'][key]['NAME']}</a>
                <p>${data['Bonds'][key]['LOTVALUE']}</p>
                <p>${data['Bonds'][key]['LOW']}</p>
                <p>${data['Bonds'][key]['HIGH']}</p>
                <p>${data['Bonds'][key]['YIELD']}</p>` +
                `</div>` +
                `<div class="collapse" id="collapseExample${data['Bonds'][key]['ISIN']}">
                <div class = "card card-body">
                    <p><b>ISIN:</b> ${data['Bonds'][key]['ISIN']}</p>
                    <p><b>Количество лотов:</b> ${profile['liked_bonds'][key]['count']}</p>
                    <p><b>Цена покупки:</b> ${profile['liked_bonds'][key]['likedCost']}</p>
                    <p><b>Цена открытия:</b> ${data['Bonds'][key]['OPEN']}</p>
                    <p><b>Цена сейчас:</b> ${data['Bonds'][key]['LAST']}</p>
                    <p><b>МИН:</b> ${data['Bonds'][key]['LOW']} <b>МАКС</b> ${data['Bonds'][key]['HIGH']}</p> 
                    <p><b>Размер лота</b> ${data['Bonds'][key]['LOTVALUE']} </p>  
                    <div id="note${data['Bonds'][key]['ISIN']}">
                        <p><b>Заметка:</b></p>
                        <p>${(profile['liked_bonds'][key]['note'] ? profile['liked_bonds'][key]['note'] : "")}</p>
                    </div>
                </div>
                 <div style="max-width: 100%; height: 450px; margin: auto" id="plot${data['Bonds'][key]['ISIN']}" class="js-plotly-plot"></div>
                <button type="button" class="btn btn-primary btn" onclick="modal('Bonds', '${user_profile}', '${data['Bonds'][key]['ISIN']}', ${data['Bonds'][key]['LAST']})">Изменить</button>
                <button type="button" class="btn btn-primary btn" onclick="NoteModal('${user_profile}', '${data['Bonds'][key]['ISIN']}', 'Bonds')">Заметка</button>
            </div>`
            profileCost += (data['Bonds'][key]['LAST'] / 100) * data['Bonds'][key]['LOTVALUE'] * profile['liked_bonds'][key]['count']
            profileBeginPrice += (profile['liked_bonds'][key]['likedCost'] / 100 )* data['Bonds'][key]['LOTVALUE'] * profile['liked_bonds'][key]['count']
        }
        
        return elem;
    })
    $('#costValue').text(profileCost+'₽');
    //    profileCost- profileBeginPrice
    $('#income_valueValue').text(profileCost- profileBeginPrice);
    $('#income_percentValue').text((profileCost- profileBeginPrice) / profileBeginPrice)

}

async function GetProfile(user) {
  try {
    const response = await fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?profile=${user}&action=Profile`, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error('Ошибка сети');
    }

    const data = await response.json(); // ← вот здесь результат
    return data; // ← сохранили и вернули
  } catch (err) {
    console.error('Ошибка запроса:', err);
    return null; // ← если ошибка — вернуть null
  }
}

function NoteModal(user, ISIN, type){
    var title = "Изменить заметку";
    var input = `
    <div class="form-group">
					<label for="count">Введите заметку</label>
					<input id="note" name="заметка" class="form-control form-control-sm" type="text">
     </div>`
    var form = `<form id="updateTaskForm" onsubmit="return false;">${input}</form>`;
    var button = `<button type="button" class="btn btn-success" onclick="SetNote('${user}', '${ISIN}', '${type}', true)" data->Подтвердить</button>` +
                  `<button type="button" class="btn btn-danger" onclick="SetNote('${user}', '${ISIN}', '${type}', false)" data->Удалить</button>`;
    $('#commonModal .modal-header .modal-title').html(title);
    $('#commonModal .modal-body').html(form);
    $('#commonModal .modal-footer').html(button);
    $('#commonModal').modal('show');
}
function SetNote(user, ISIN, type, flag){
    if (flag == true){
        var note = document.getElementById('note').value
    }
    else{
        note = "";
    }
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&profile=${user}&user_note=${note}&action=note`, {
        method: "GET"
    })
    $('#commonModal').modal('toggle');
    SetProfile(marketdata, user);
}

async function CheckProfile(user_profile){
    res = await GetProfile(user_profile);
    if (res != null){
        console.log('Succes')
        window.location.href = 'profile.html';
        return;
    }
    else{
        console.log('profile not found')
        ModalCreateProfile(user_profile);
    }
}

function MakeChart(ISIN, type) {
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&action=chart`, {
        method: "GET"
    })
        .then(response => response.json())
        .then((data) => Plotly.newPlot(`plot${ISIN}`, data['data'], data['layout']))
    //console.log(chart)  
    
}

function ModalCreateProfile(user_profile){
    var title = "Хотите создать профиль?";
    var button = `<button type="button" class="btn btn-success" onclick="CreateProfile('${user_profile}')" data->Подтвердить</button>` +
                  `<button type="button" class="btn btn-danger" onclick="$('#commonModal').modal('toggle')" data->Отказаться</button>`;

    $('#commonModal .modal-header .modal-title').html(title);
    $('#commonModal .modal-body').html('');
    $('#commonModal .modal-footer').html(button);
    $('#commonModal').modal('show');          
}

function CreateProfile(user_profile){
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?profile=${user_profile}&action=Create`, {
        method: "GET",
    })
    $('#commonModal').modal('toggle');
}

function modal(type, user, ISIN, cost) {
    var title = "Изменить бумагу";
    var input = `
    <div class="form-group">
					<label for="count">Введите количество бумаг</label>
					<input id="count" name="email" class="form-control form-control-sm" type="text">
     </div>`
    var form = `<form id="updateTaskForm" onsubmit="return false;">${input}</form>`;
    var button = `<button type="button" class="btn btn-success" onclick="InsertStonk('${type}', '${user}', '${ISIN}', ${cost})" data->Подтвердить</button>` +
                  `<button type="button" class="btn btn-danger" onclick="RemoveStonk('${type}', '${user}', '${ISIN}')" data->Удалить</button>`;
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
    console.log(marketdata)
    SetProfile(marketdata, user)
}

function RemoveStonk(type, user, ISIN) {
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&user=${user}&isin=${ISIN}&action=Remove`, {
        method: "GET",
    })
    $('#commonModal').modal('toggle');
    SetProfile(marketdata, user);
}
