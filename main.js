///Este desarrollo no es reactivo///

//Lectura de datos > Para indicar última fecha
data = 'https://covid.ourworldindata.org/data/owid-covid-data.csv';

//// FORMULARIO

//Selección de países
document.getElementById('countries').addEventListener('change', function(e) {
    setCountriesSelected(e.target);
});
function setCountriesSelected(selector) {
    let result = [];
    let options = selector.options;

    for (let i=0; i < options.length; i++) {
        if (options[i].selected) {
            result.push(options[i].text);
        }
    }

    document.getElementById('countries_selected').textContent = result.join(', ');
}

//Selección de fecha para eje X
let xDateTypeSelected = 'static';
showxAxisDate(xDateTypeSelected);
let xRadios = document.querySelectorAll('input[type=radio][name=date_xaxis]');

for(let i = 0; i < xRadios.length; i++) {
    xRadios[i].addEventListener('change', function(e) {
        xDateTypeSelected = e.target.value;
        showxAxisDate(xDateTypeSelected);
    });
}

function showxAxisDate(picker) {
    if (picker == 'static') {
        document.getElementsByClassName('static-picker')[0].classList.add('visible');
        document.getElementsByClassName('period-picker')[0].classList.remove('visible');
    } else {
        document.getElementsByClassName('static-picker')[0].classList.remove('visible');
        document.getElementsByClassName('period-picker')[0].classList.add('visible');
    }
}

//Selección de fecha para eje Y
let yDateTypeSelected = 'static';
showyAxisDate(yDateTypeSelected);
let yRadios = document.querySelectorAll('input[type=radio][name=date_yaxis]');

for(let i = 0; i < yRadios.length; i++) {
    yRadios[i].addEventListener('change', function(e) {
        yDateTypeSelected = e.target.value;
        showyAxisDate(yDateTypeSelected);
    });
}

function showyAxisDate(picker) {
    if (picker == 'static') {
        document.getElementsByClassName('static-picker')[1].classList.add('visible');
        document.getElementsByClassName('period-picker')[1].classList.remove('visible');
    } else {
        document.getElementsByClassName('static-picker')[1].classList.remove('visible');
        document.getElementsByClassName('period-picker')[1].classList.add('visible');
    }
}


//// DESCARGA DE DATOS
d3.csv(data, function(error, data) {
    if (error) throw error;

    //En primer lugar, cuando tengamos la última fecha con datos, modificamos los inputs de tipo fecha
    let currentDate = data[data.length - 1].date;
    let previousDate = new Date(currentDate);
    previousDate.setMonth(previousDate.getMonth() - 1);
    let previousYear = previousDate.getFullYear();
    let previousMonth = previousDate.getMonth() + 1 < 10 ? '0' + (previousDate.getMonth() + 1): previousDate.getMonth() + 1;
    let previousDay = previousDate.getDate() < 10 ? '0' + previousDate.getDate() : previousDate.getDate();
    previousDate = previousYear + '-' + previousMonth + '-' + previousDay;
    
    document.getElementById('xaxis_static').value = currentDate;
    document.getElementById('xaxis_static').max = currentDate;
    document.getElementById('yaxis_static').value = currentDate;
    document.getElementById('yaxis_static').max = currentDate;

    document.getElementById('xaxis_period_1').value = previousDate;
    document.getElementById('xaxis_period_2').max = currentDate;
    document.getElementById('yaxis_period_1').value = previousDate;
    document.getElementById('yaxis_period_2').max = currentDate;

    //Antes de nada, dejamos cargados los datos agrupados por países
    let nested_data = d3.nest()
        .key(function(d) { return d.location; })
        .entries(data);   

    //Procesamiento de datos
    if(nested_data) {
        document.getElementsByClassName('content')[0].style.display = 'block';
        document.getElementsByClassName('loading')[0].style.display = 'none';
    }
    
});