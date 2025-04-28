function SetData(data){
    $('#container').html(function(){
        var len = Object.keys(data).length;
        console.log(len)
        elem = ``;
        for(let key in data['Shares']){
            console.log(data['Shares'][key])
            elem += `<p><a class="btn btn-primary" data-toggle="collapse" href="#collapseExample${data['Shares'][key]['ISIN']}" role="button" aria-expanded="false" aria-controls="collapseExample">${data['Shares'][key]['NAME']}</a></p>` +
            `<div class="collapse" id="collapseExample${data['Shares'][key]['ISIN']}">
                <div class="card card-body">
                ISIN: ${data['Shares'][key]['ISIN']} <br> OPEN: ${data['Shares'][key]['OPEN']} <br> LAST: ${data['Shares'][key]['LAST']} 
                </div>
            </div>`  
        }
        return elem; 
    })
}