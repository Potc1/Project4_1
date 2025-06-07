let marketdata = 0
const params = new URLSearchParams(window.location.search);
const user_profile_id = params.get('userId'); 
// Firebase импорты
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Глобальные переменные
let tg;
let database;

// Форматирование цены
function formatPrice(price) {
  if (!price) return '0.00 ₽';
  return parseFloat(price).toFixed(2) + ' ₽';
}

// Функция обновления таблицы акций
async function updateAssetTable(data, containerId, assetType, userId) {

  let profileData = await GetProfile(userId);
  marketdata = data;
  console.log(profileData)
  const tbody = $(`#${containerId}`);
  tbody.empty();

  if (!data || Object.keys(data).length === 0) {
    tbody.html('<tr><td colspan="4" class="text-center">Нет данных для отображения</td></tr>');
    return;
  }
  let assetsArray = 0
  try {
    if (assetType == 'Shares') {
      assetsArray = Object.keys(profileData['liked_shares'])
    }
    else {
      assetsArray = Object.keys(profileData['liked_bonds'])
    }
    if (assetsArray.length === 0) {
      tbody.html('<tr><td colspan="4" class="text-center">Нет корректных данных</td></tr>');
      return;
    }

    const sortedAssets = assetsArray.sort((a, b) => (a.NAME || '').localeCompare(b.NAME || ''));
    console.log(sortedAssets)
    sortedAssets.forEach(asset => {
      const row = `
        <tr data-isin="${asset || ''}">
          <td>
            <a href="#" class="asset-link" 
               data-isin="${asset || ''}"s
               data-type="${assetType}"
               data-name="${data[asset]['NAME'] || ''}">
              ${data[asset]['NAME'] || 'Без названия'}
            </a>
            <div id="chart-${data[asset]['ISIN'] || ''}" class="mt-3" style="display:none; height: 300px;"></div>
          </td>
          <td class="text-end">${data[asset]['LOTSIZE'] || data[asset]['LOTVALUE']}</td>
          <td class="text-end">${formatPrice(data[asset]['LOW'])}</td>
          <td class="text-end">${formatPrice(data[asset]['HIGH'])}</td>
        </tr>
      `;
      tbody.append(row);
    });
  } catch (error) {
    console.error(`Ошибка при обновлении таблицы ${assetType}:`, error);
    tbody.html('<tr><td colspan="4" class="text-center text-danger">Ошибка загрузки данных</td></tr>');
  }
}

// Основная функция обработки данных
function SetData(data, userId) {
  if (!data) {
    console.error("Данные не определены");
    return;
  }

  if (data.Shares) {
    updateAssetTable(data.Shares, 'stocksData', 'Shares', userId);
  } else {
    $('#stocksData').html('<tr><td colspan="4" class="text-center">Акции не найдены</td></tr>');
  }

  if (data.Bonds) {
    updateAssetTable(data.Bonds, 'bondsData', 'Bonds', userId);
  } else {
    $('#bondsData').html('<tr><td colspan="4" class="text-center">Облигации не найдены</td></tr>');
  }
}

// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAi77EjCTf-jxeJ6MjKv9hG9-hB8Zw8jNE",
  authDomain: "imoex2.firebaseapp.com",
  databaseURL: "https://imoex2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "imoex2",
  storageBucket: "imoex2.firebasestorage.app",
  messagingSenderId: "334419845868",
  appId: "1:334419845868:web:155f088633782940563bc9"
};

const app = initializeApp(firebaseConfig);
database = getDatabase(app);
const dataRef = ref(database, "/");

// Инициализация Telegram WebApp
function initTelegramWebApp() {
  if (typeof Telegram !== 'undefined') {
    tg = window.Telegram.WebApp;
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      $('.stock-chart').hide();
      tg.BackButton.hide();
    });
    console.log("Telegram WebApp инициализирован");
  }
}

// Подписка на изменения данных
function initFirebaseListener() {
  onValue(dataRef, (snapshot) => {
    try {
      const data = snapshot.val();
      console.log("Получены данные из Firebase:", data);

      const userId = tg?.initDataUnsafe?.user?.id || 'user';
      SetData(data, userId, 1);
    } catch (error) {
      console.error("Ошибка при обработке данных из Firebase:", error);
    }
  });
}

// Инициализация при загрузке страницы
$(document).ready(function () {
  console.log("Документ готов");

  initTelegramWebApp();
  initFirebaseListener(); // сюда кидаем данные из модального окна, например номер профиля пользователя или id

  // Обработчик для аккордеона
  $('.accordion-btn').click(function () {
    const icon = $(this).find('.accordion-icon');
    icon.text(icon.text() === '+' ? '-' : '+');
  });

  // Обработчик клика по акциям
  $(document).on('click', '.asset-link', function (e) {
    e.preventDefault();
    const isin = $(this).data('isin');
    const type = $(this).data('type');
    const chartDiv = $(`#chart-${isin}`);

    if (chartDiv.is(':visible')) {
      chartDiv.hide();
    } else {
      $('.stock-chart').hide();
      MakeChart(isin, type);
    }
  });
});

// Функция для отображения графика
function MakeChart(ISIN, type) {
  const chartDiv = $(`#chart-${ISIN}`);
  chartDiv.show().html(`
    <div class="chart-loading text-center py-4">
      <p class="mt-2">Загрузка графика...</p>
    </div>`);

  fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&action=chart`)
    .then(response => response.json())
    .then(data => {
      if (data && data.data) {
        chartDiv.empty();
        Plotly.newPlot(`chart-${ISIN}`, data.data, data.layout);
      } else {
        chartDiv.html('<div class="text-center text-danger py-4">Данные графика не получены</div>');
      }
    })
    .catch(error => {
      console.error("Ошибка при загрузке графика:", error);
      chartDiv.html('<div class="text-center text-danger py-4">Ошибка загрузки графика</div>');
    });
}
// Делаем функции доступными глобально
window.SetData = SetData;
window.MakeChart = MakeChart;
window.CheckProfile = CheckProfile;
//window.SetProfileId = SetProfileId;

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

function NoteModal(user, ISIN, type) {
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
function SetNote(user, ISIN, type, flag) {
  if (flag == true) {
    var note = document.getElementById('note').value
  }
  else {
    note = "";
  }
  fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}&profile=${user}&user_note=${note}&action=note`, {
    method: "GET"
  })
  $('#commonModal').modal('toggle');
  SetProfile(marketdata, user);
}

async function CheckProfile(user_profile) {
  let res = await GetProfile(user_profile);
  if (res != null) {
    console.log('Succes')
    ModalCreateProfile(user_profile, "Choose");
    //window.location.href = 'profile.html';
    return;
  }
  else {
    console.log('profile not found')
    ModalCreateProfile(user_profile, "Create");
  }
}

async function ModalCreateProfile(user_profile, type) {
  let title = ``;
  let button = ``;
  let body = '';
  switch (type){
    case "Create":
      title = "Хотите создать профиль?";
      button = `<button type="button" class="btn btn-success" onclick="CreateProfile('${user_profile}')" data->Подтвердить</button>` +
      `<button type="button" class="btn btn-danger" onclick="$('#commonModal').modal('toggle')" data->Отказаться</button>`;
      break;
    case "Choose":
      let profile = await GetProfile(user_profile);
      title = `Выберете профиль`;
      body = `<ul>`
      for(let elem in profile){
        body += `<li><button type="button" class="btn btn-light" onclick="SetProfileId('${elem}')">${elem}</button></li>`
      }
      body += `</ul>`
      button = `<button type="button" class="btn btn-success" onclick="window.location.href=profile.html?userId=${user_profile}" data->Подтвердить</button>` +
      `<button type="button" class="btn btn-danger" onclick="$('#commonModal').modal('toggle')" data->Отказаться</button>`;
      break;
  }
  $('#commonModal .modal-header .modal-title').html(title);
  $('#commonModal .modal-body').html(body);
  $('#commonModal .modal-footer').html(button);
  $('#commonModal').modal('show');
}

/*
function SetProfileId(profile_id){
  user_profile_id = profile_id;
  window.location.href = 'profile.html';
}
*/

function CreateProfile(user_profile) {
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
