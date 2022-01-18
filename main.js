///Este desarrollo no es reactivo///

//Lectura de datos > Para indicar última fecha
data = 'https://covid.ourworldindata.org/data/owid-covid-data.csv';

//// FORMULARIO

//Consideraciones previas
let showTotal = false;
document.getElementById('btnShowMore').addEventListener('click', function() {
    showMore();
});

function showMore() {
    let moreText = document.getElementById("showMore");
    let btnText = document.getElementById("btnShowMore");
  
    if (showTotal) {
      btnText.innerHTML = "Leer más"; 
      moreText.style.display = "none";
    } else {
      btnText.innerHTML = "Leer menos"; 
      moreText.style.display = "inline";
    }

    showTotal = !showTotal;
}

//Selección de países
let countriesSelected = [];

document.getElementById('countries').addEventListener('change', function(e) {
    setCountriesSelected(e.target);
});

function setCountriesSelected(selector) {
    let options = selector.options;

    countriesSelected = [];

    for (let i=0; i < options.length; i++) {
        if (options[i].selected) {
            countriesSelected.push(options[i].text);
        }
    }

    let countriesSelectedSet = new Set(countriesSelected);

    countriesSelected = [...countriesSelectedSet];

    document.getElementById('countries_selected').textContent = countriesSelected.join(', ');
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

/////
//// DATOS
/////
d3.csv(data, function(error, data) {
    if (error) throw error;

    //En primer lugar, cuando tengamos la última fecha con datos, modificamos los inputs de tipo fecha
    let currentDate = data[data.length - 1].date;
    setOwidDate();    

    //Visibilidad del bloque
    if(data) {
        document.getElementsByClassName('content-first')[0].style.display = 'block';
        document.getElementsByClassName('loading')[0].style.display = 'none';
    }

    ////////
    ////////
    document.getElementById('btnSetChart').addEventListener('click', function() {
        setNewChart();
    });

    function setNewChart() {
        //Validación de elementos del formulario
        let formValidated = setValidation();

        if(formValidated) {
            document.getElementsByClassName('c-chart')[0].style.display = 'block';

            let auxData = setAuxData();      
            setChart(auxData);

            document.getElementById('chartAsImage').addEventListener('click', function() {
                setChartAsImage();
            });

            document.getElementById('chartAsData').addEventListener('click', function() {
                setChartAsData(auxData);
            });
        } else {
            document.getElementsByClassName('b-error')[0].style.display = 'block';
        }        
    }

    //Helpers
    function setOwidDate() {        
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
        document.getElementById('xaxis_period_1').max = currentDate;
        document.getElementById('xaxis_period_2').value = currentDate;
        document.getElementById('xaxis_period_2').max = currentDate;

        document.getElementById('yaxis_period_1').value = previousDate;
        document.getElementById('yaxis_period_1').max = currentDate;
        document.getElementById('yaxis_period_2').value = currentDate;
        document.getElementById('yaxis_period_2').max = currentDate;
    }

    function setValidation() {
        let formValidated = true;

        //Borrado previo
        let currentError = document.getElementsByClassName('b-error')[0];

        while(currentError.hasChildNodes()) {
            currentError.removeChild(currentError.firstChild);
        }

        //Proceso
        if (countriesSelected.length == 0) {
            let p = document.createElement('p');
            p.textContent = 'Ningún país ha sido seleccionado';
            document.getElementsByClassName('b-error')[0].appendChild(p);
            formValidated = false;
        }

        let max = new Date(currentDate), min = new Date('2020-02-24');
        
        if(xDateTypeSelected == 'static') {
            let xAxisSelected = new Date(document.getElementById('xaxis_static').value);

            if(xAxisSelected.getTime() < min.getTime() || xAxisSelected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La fecha estática del eje X no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }
        } else {
            let xAxisPeriod1Selected = new Date(document.getElementById('xaxis_period_1').value);
            let xAxisPeriod2Selected = new Date(document.getElementById('xaxis_period_2').value);
            
            if(xAxisPeriod1Selected.getTime() < min.getTime() || xAxisPeriod1Selected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La primera fecha del intervalo del eje X no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }

            if(xAxisPeriod2Selected.getTime() < min.getTime() || xAxisPeriod2Selected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La segunda fecha del intervalo del eje X no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }

            if(xAxisPeriod1Selected.getTime() >= xAxisPeriod2Selected.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La primera fecha del intervalo del eje X es igual o mayor que la segunda fecha.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }
        }

        if(yDateTypeSelected == 'static') {
            
            let yAxisSelected = new Date(document.getElementById('yaxis_static').value);

            if(yAxisSelected.getTime() < min.getTime() || yAxisSelected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La fecha estática del eje Y no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }
        } else {
            let yAxisPeriod1Selected = new Date(document.getElementById('yaxis_period_1').value);
            let yAxisPeriod2Selected = new Date(document.getElementById('yaxis_period_2').value);
            
            if(yAxisPeriod1Selected.getTime() < min.getTime() || yAxisPeriod1Selected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La primera fecha del intervalo del eje Y no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }

            if(yAxisPeriod2Selected.getTime() < min.getTime() || yAxisPeriod2Selected.getTime() > max.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La segunda fecha del intervalo del eje Y no está entre el rango de fechas especificado.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }

            if(yAxisPeriod1Selected.getTime() >= yAxisPeriod2Selected.getTime()) {
                let p = document.createElement('p');
                p.textContent = 'La primera fecha del intervalo del eje Y es igual o mayor que la segunda fecha.';
                document.getElementsByClassName('b-error')[0].appendChild(p);
                formValidated = false;
            }
        }

        return formValidated;
    }

    function setAuxData() {
        let xAxisData = [], yAxisData = [], xAxisDataFinal = [], yAxisDataFinal = [], dataFinal = [];
        
        for (let i = 0; i < data.length; i++) {
            if(countriesSelected.includes(data[i].location)) {
                
                //Eje X
                if(xDateTypeSelected == 'static') {
                    if(document.getElementById('xaxis_static').value == data[i].date) {
                        let variableX = document.getElementById('variable_x').value;
                        document.getElementById('xAxisText').textContent = document.querySelector('option[value=' + variableX + ']').textContent;
                        xAxisData.push({country: data[i].location, country_iso: data[i].iso_code, data: parseFloat(data[i][variableX]), type: 'static', type2: ''});
                    }
                } else {                    
                    if(document.getElementById('xaxis_period_1').value == data[i].date) {
                        let variableX = document.getElementById('variable_x').value;
                        document.getElementById('xAxisText').textContent = 'Variación temporal en ' + document.querySelector('option[value=' + variableX + ']').textContent.toLocaleLowerCase() + ' (en %)';
                        xAxisData.push({country: data[i].location, country_iso: data[i].iso_code, date: data[i].date, data: parseFloat(data[i][variableX]), type: 'period', type2: 'start'});
                    }

                    if(document.getElementById('xaxis_period_2').value == data[i].date) {
                        let variableX = document.getElementById('variable_x').value;
                        xAxisData.push({country: data[i].location, country_iso: data[i].iso_code, date: data[i].date, data: parseFloat(data[i][variableX]), type: 'period', type2: 'end'});
                    }

                }

                //Eje Y
                if(yDateTypeSelected == 'static') { 
                    if(document.getElementById('yaxis_static').value == data[i].date) {
                        let variableY = document.getElementById('variable_y').value;
                        document.getElementById('yAxisText').textContent = document.querySelector('option[value=' + variableY + ']').textContent;
                        yAxisData.push({country: data[i].location, country_iso: data[i].iso_code, data: parseFloat(data[i][variableY])});
                    }
                } else {
                    if(document.getElementById('yaxis_period_1').value == data[i].date) {
                        let variableY = document.getElementById('variable_y').value;
                        document.getElementById('yAxisText').textContent = 'Variación temporal en ' + document.querySelector('option[value=' + variableY + ']').textContent.toLocaleLowerCase() + ' (en %)';
                        yAxisData.push({country: data[i].location, country_iso: data[i].iso_code, date: data[i].date, data: parseFloat(data[i][variableY]), type: 'period', type2: 'start'});
                    }

                    if(document.getElementById('yaxis_period_2').value == data[i].date) {
                        let variableY = document.getElementById('variable_y').value;
                        yAxisData.push({country: data[i].location, country_iso: data[i].iso_code, date: data[i].date, data: parseFloat(data[i][variableY]), type: 'period', type2: 'end'});
                    }
                }
            }
        }

        //Hacemos nuevo cribado para quedarnos con la variación del periodo temporal si lo hubiese            
        if(xAxisData[0].type == 'period') {
            for(let i = 0; i < xAxisData.length; i+=2) {
                let data1 = xAxisData[i].data, data2 = xAxisData[i+1].data;
                let result = ((data2 - data1) / data1) * 100;
                xAxisDataFinal.push({country: xAxisData[i].country, country_iso: xAxisData[i].country_iso, data : result});
            }
        } else {
            xAxisDataFinal = [...xAxisData];
        }

        if(yAxisData[0].type == 'period') {
            for(let i = 0; i < yAxisData.length; i+=2) {
                let data1 = yAxisData[i].data, data2 = yAxisData[i+1].data;
                let result = ((data2 - data1) / data1) * 100;
                xAxisDataFinal.push({country: yAxisData[i].country, country_iso: yAxisData[i].country_iso, data : result});
            }
        } else {
            yAxisDataFinal = [...yAxisData];
        }

        //Integramos los datos de X e Y en el mismo array
        for(let i = 0; i < xAxisDataFinal.length; i++) {
            dataFinal.push({country: xAxisDataFinal[i].country, country_iso: xAxisDataFinal[i].country_iso, dataX: xAxisDataFinal[i].data, dataY: yAxisDataFinal[i].data});
        }

        return dataFinal;
    }

    function setChart(dataFinal) {
        //Borramos el gráfico existente
        let currentChart = document.getElementById('chart');

        while(currentChart.hasChildNodes()) {
            currentChart.removeChild(currentChart.firstChild);
        }

        //Visualizamos el nuevo gráfico
        let auxFinal = [];

        for(let i = 0; i < dataFinal.length; i++) {
            let d = dataFinal[i];
            if(!isNaN(d.dataX) && !isNaN(d.dataY)){ 
                auxFinal.push(dataFinal[i])
            }
        }

        if(dataFinal.length != auxFinal.length) {
            //Borramos el problema existente
            let currentProblem = document.getElementsByClassName('possible-error')[0];

            while(currentProblem.hasChildNodes()) {
                currentProblem.removeChild(currentProblem.firstChild);
            }

            let p = document.createElement('p');
            p.textContent = 'Es posible que algunos de los elementos no se visualicen debido a que no disponen de datos para la fecha seleccionada.';
            document.getElementsByClassName('possible-error')[0].appendChild(p);
        }

        let margin = {top: 20, right: 70, bottom: 20, left: 70},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Eje X
        let x = d3.scaleLinear()
            .domain([
                d3.min(auxFinal.map(function(item){
                    if(item.dataX < 200) {
                        return item.dataX - 10;
                    } else if (item.dataX >= 200 && item.dataX < 2000) {
                        return item.dataX - 100;
                    } else if (item.dataX >= 2000 && item.dataX < 20000) {
                        return item.dataX - 1000;
                    } else if(item.dataX >= 20000 && item.dataX < 200000) {
                        return item.dataX - 10000;
                    } else {
                        return item.dataX - 100000;
                    }
                })),
                d3.max(auxFinal.map(function(item) {
                    if(item.dataX < 200) {
                        return item.dataX + 10;
                    } else if (item.dataX >= 200 && item.dataX < 2000) {
                        return item.dataX + 100;
                    } else if (item.dataX >= 2000 && item.dataX < 20000) {
                        return item.dataX + 1000;
                    } else if(item.dataX >= 20000 && item.dataX < 200000) {
                        return item.dataX + 10000;
                    } else {
                        return item.dataX + 100000;
                    }
                }))
            ])
            .range([0, width])
            .nice();
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5));

        //Eje Y
        let y = d3.scaleLinear()
            .domain([
                d3.min(auxFinal.map(function(item){
                    if(item.dataY < 200) {
                        return item.dataY - 10;
                    } else if (item.dataY >= 200 && item.dataY < 2000) {
                        return item.dataY - 100;
                    } else if (item.dataY >= 2000 && item.dataY < 20000) {
                        return item.dataY - 1000;
                    } else if(item.dataY >= 20000 && item.dataY < 200000) {
                        return item.dataY - 10000;
                    } else {
                        return item.dataY - 100000;
                    }
                })),
                d3.max(auxFinal.map(function(item) {
                    if(item.dataY < 200) {
                        return item.dataY + 10;
                    } else if (item.dataY >= 200 && item.dataY < 2000) {
                        return item.dataY + 100;
                    } else if (item.dataY >= 2000 && item.dataY < 20000) {
                        return item.dataY + 1000;
                    } else if(item.dataY >= 20000 && item.dataY < 200000) {
                        return item.dataY + 10000;
                    } else {
                        return item.dataY + 100000;
                    }
                }))
            ])
            .range([height, 0])
            .nice();
        
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5));

        node = svg.append('g');
        
        //Dots
        node.selectAll("dot")
            .data(auxFinal)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.dataX); })
            .attr("cy", function (d) { return y(d.dataY); })
            .attr("r", 4.5)
            .style("fill", "#4e7e7e");

        //Texto
        node.selectAll('text')
            .data(auxFinal)
            .enter()
            .append('text')
            .attr("x", function(d) { return x(d.dataX) + 1.5; })
            .attr("y", function(d) { return y(d.dataY) - 8.5; })
            .text(function(d) { return d.country_iso; });    
    }

    function setChartAsImage() {
        //Creación del canvas
        html2canvas(document.querySelector(".b-chart"), {
            width: document.querySelector('.b-chart').clientWidth, 
            height: document.querySelector('.b-chart').clientHeight, 
            imageTimeout: 3000, useCORS: true
        }).then(canvas => {
            //Descarga de la imagen
            var image = canvas.toDataURL();
            // Create a link
            var aDownloadLink = document.createElement('a');
            // Add the name of the file to the link
            aDownloadLink.download = 'scatterplot_owid_cchs.png';
            // Attach the data to the link
            aDownloadLink.href = image;
            // Get the code to click the download link
            aDownloadLink.click();
        });
    }

    function setChartAsData(auxData) {
        //Conversión de datos
        let csvData = convertJSON(auxData);

        //Descarga de datos
        let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, 'scatterplot_owid_cchs_data.csv');
        } else {
            let link = document.createElement("a");
            
            if (link.download !== undefined) {
                let url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", 'scatterplot_owid_cchs_data.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        
    }

    function convertJSON(objArray) {
        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        let str = 'country;country_iso;data_x;data_y' + '\r\n';
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (line != '') line += ';'
    
                line += array[i][index];
            }
            str += line + '\r\n';
        }
        return str;
    }    
});