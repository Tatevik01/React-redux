import React from 'react';
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['$0-1K Month', '$0-1K Month', '$0-1K Month', '$0-1K Month', '$0-1K Month', '$0-1K Month'],
  datasets: [
    {
        type: 'bar',
        label: 'My First dataset',
        backgroundColor: '#3898DE',
        borderColor: '#3898DE',
        borderWidth: 1,
        hoverBackgroundColor: '#0f899a',
        hoverBorderColor: '#0f899a',
        data: [0, 7, 0, 20, 0, 0, 25],
        barPercentage: 0.5,        
    }
  ]
};

const options = {
    responsive: true,
    scales: {
        xAxes: [{            
            gridLines: {display: false} ,
            ticks: {
                callback: function(label) {
                    if (/\s/.test(label)) {
                        return label.split(" ");
                    }else{
                        return label;
                    }              
                }
        }}],
        yAxes: [{ticks: {beginAtZero: true , display: false}, gridLines: { zeroLineColor: '#3898DE', color:'transparent' }, display: true }],
    },
    legend: {
        display: false,
    },
    "hover": {
        "animationDuration": 0
    },
    "animation": {
        "duration": 1,
        "onComplete": function() {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;  
            ctx.textAlign = 'center';
  
          this.data.datasets.forEach(function(dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function(bar, index) {
                if ( dataset.data[index] === 0 ) {
                    var data = ''
                }else {
                    var data = dataset.data[index] + ' Sites';
                }
              ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
          });
        }
      },
    tooltips: {
        enabled: false,
    },
};

const Chart = () => {
    
    return(
        <Bar data={data} options={options} />
    )
}

export default Chart