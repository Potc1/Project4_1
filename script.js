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
function updateAssetTable(data, containerId, assetType) {
  const tbody = $(`#${containerId}`);
  tbody.empty();

  if (!data || Object.keys(data).length === 0) {
    tbody.html('<tr><td colspan="4" class="text-center">Нет данных для отображения</td></tr>');
    return;
  }

  try {
    const assetsArray = Object.entries(data)
      .map(([key, value]) => ({ ...value, id: key }))
      .filter(asset => asset && asset.NAME);

    if (assetsArray.length === 0) {
      tbody.html('<tr><td colspan="4" class="text-center">Нет корректных данных</td></tr>');
      return;
    }

    const sortedAssets = assetsArray.sort((a, b) => (a.NAME || '').localeCompare(b.NAME || ''));

    sortedAssets.forEach(asset => {
      const row = `
        <tr data-isin="${asset.ISIN || ''}">
          <td>
            <a href="#" class="asset-link" 
               data-isin="${asset.ISIN || ''}"
               data-type="${assetType}"
               data-name="${asset.NAME || ''}">
              ${asset.NAME || 'Без названия'}
            </a>
            <div id="chart-${asset.ISIN || ''}" class="mt-3" style="display:none; height: 300px;"></div>
          </td>
          <td class="text-end">${asset.LOTSIZE || asset.LOTVALUE}</td>
          <td class="text-end">${formatPrice(asset.LOW)}</td>
          <td class="text-end">${formatPrice(asset.HIGH)}</td>
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
    updateAssetTable(data.Shares, 'stocksData', 'Shares');
  } else {
    $('#stocksData').html('<tr><td colspan="4" class="text-center">Акции не найдены</td></tr>');
  }
  
  if (data.Bonds) {
    updateAssetTable(data.Bonds, 'bondsData', 'Bonds');
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
      SetData(data, userId);
    } catch (error) {
      console.error("Ошибка при обработке данных из Firebase:", error);
    }
  });
}

// Инициализация при загрузке страницы
$(document).ready(function() {
  console.log("Документ готов");
  
  initTelegramWebApp();
  initFirebaseListener();
  
  // Обработчик для аккордеона
  $('.accordion-btn').click(function() {
    const icon = $(this).find('.accordion-icon');
    icon.text(icon.text() === '+' ? '-' : '+');
  });
  
  // Обработчик клика по акциям
  $(document).on('click', '.asset-link', function(e) {
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