function SetData(data){
    $('#container').html(function(){
        var len = Object.keys(data).length;
        console.log(len)
        elem = `<h3> Акции </h3>
                <br> 
                <hr align="center" width="100%"/> `;
        for(let key in data['Shares']){
            elem += `<p><a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Shares'][key]['ISIN']}" onclick="event.preventDefault(); MakeChart('${data['Shares'][key]['ISIN']}', 'Shares');" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Shares'][key]['NAME']}</a></p>` + // не менять
            `<div class="collapse" id="collapseExample${data['Shares'][key]['ISIN']}"> // не менять
                <div class="card card-body"> // не менять
                <b>ISIN:</b> ${data['Shares'][key]['ISIN']} <br> <b>OPEN:<b> ${data['Shares'][key]['OPEN']} LOW: ${data['Shares'][key]['LOW']} <br> <b>LAST:<b> ${data['Shares'][key]['LAST']} HIGH: ${data['Shares'][key]['HIGH']} 
                </div>
                    <div style="max-width: 100%; height: 450px; margin: auto" id="plot${data['Shares'][key]['ISIN']}" class="js-plotly-plot"></div> // не менять
                <button type="button" class="btn btn-primary btn">Добавить</button> // не менять
            </div>` 
            
        }
        elem += `<h3> Облигации </h3></hr> 
                <br> 
                <hr align="center" width="100%"/> `;
        for(let key in data['Bonds']){
            elem += `<p><a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Bonds'][key]['ISIN']}" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Bonds'][key]['NAME']}</a></p>` + // не менять
               `<div class="collapse" id="collapseExample${data['Bonds'][key]['ISIN']}"> // не менять
                 <div class="card card-body"> // не менять
                ISIN: ${data['Bonds'][key]['ISIN']} <br> <br> OPEN: ${data['Bonds'][key]['OPEN']} <br> LAST: ${data['Bonds'][key]['LAST']}  
                </div> 
             </div>` 
        }
        
        return elem; 
    })
}

function MakeChart(ISIN, type){
    fetch(`https://script.google.com/macros/s/AKfycbzYbVQKlcIVXaqDP2ZpvSoVMs80_KbRX4r1cSdR4mtgy6YXIufTUs-vFlIijFNnM4Jbgg/exec?type=${type}&isin=${ISIN}`, {
        method : "GET"
    })
    .then(response => response.json())
    .then((data) =>  Plotly.newPlot(`plot${ISIN}`, data['data'], data['layout']))
    //console.log(chart)
   
}