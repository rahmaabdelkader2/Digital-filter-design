function makePlotly_trackpad(x, y1, xrange, yrange, place, title) {
    let traces = [
        {
            x: x,
            y: y1,
            name: " input",
            xaxis: 'time ',
            yaxis: 'magintude',
            line: {
                color: "#8a888976",
                width: 3
            }
        }
    ];
    let layout = {
        title: title,
        yaxis: {
            range: yrange
        },
        margin: {
            b: 15,
            r: 0,
            t: 28
        },

        xaxis: {
            range: xrange
        },
        plot_bgcolor: 'wight',
        paper_bgcolor: 'transparent'
    };

    let config = {
        responsive: true,
    };

    Plotly.newPlot(place, traces, layout, config);
}
let pad = document.getElementById("track_pad");
const x_value = [];
const y_value = [];
let i = 0;
let x_length = 0;
makePlotly_trackpad(x_value, y_value, [x_length, x_length + 300], [0, 300], "track", "input");
makePlotly_trackpad(x_value, y_value, [x_length, x_length + 300], [0, 300], "out-track", "output");

pad.addEventListener('mousemove', function (e) {
    i++;
    x_value.push(i);
    y_value.push(100 - (e.y - 40) + 100);
    if (i > 300) {
        x_length = i - 300;
    }
    makePlotly_trackpad(x_value, y_value, [x_length, x_length + 300], [0, 300], "track", "input");
    y_send={'y_axis':y_value}
    $.ajax({
      url: "/generte_signal",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(y_send),
      success: function (response) {
          console.log("done generate signal")
          makePlotly_trackpad(x_value, JSON.parse(response), [x_length, x_length + 300], [0, 300], "out-track", "output");
        
      },
  });
});

function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }


  //modal

  const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}


$(document).ready(function() {
  $("#color_mode").on("change", function () {
      colorModePreview(this);
  })
});

function colorModePreview(ele) {
  if($(ele).prop("checked") == true){
      $('body').addClass('dark-preview');
      $('body').removeClass('white-preview');
  }
  else if($(ele).prop("checked") == false){
      $('body').addClass('white-preview');
      $('body').removeClass('dark-preview');
  }
}

function ExportFilter(){
  console.log("export data ?")
  data_sent="1"
  $.ajax({
    url: "/exportFilter",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data_sent),
    success: function (response) {
        console.log("done export data ")
    },
});

}
/********************************************************Real time plotting*********************************************************************/ 
signal = []
x_s = [0]
x_val = 0


document.getElementById('generate-sig').addEventListener('click',function(){
  document.getElementById('import-sig').disabled = false;
  // document.getElementById('pad').style.display = "flex"   ;
  // document.getElementById('padreplacement').style.display = "none"   ;
})

document.getElementById('import-sig').addEventListener('click',function(){
  document.getElementById('generate-sig').disabled = false;
  document.getElementById ("import-signal").click();
})



function update_graph(x) {
  signal.push(x);
  x_val ++;
  x_s.push(x_val);
  if (x_s.length > 100) {
      x_s.shift();
      signal.shift();
  }
  Plotly.newPlot('plot', [{
      x: x_s,
      y: signal,
      type: 'scatter'
  }]);

}

var layoutinput = {
  title: {
    text:'Input Signal',
    font: {
      family: 'Courier New, monospace',
      size: 25
    },
}};
var layoutoutput = {
  title: {
    text:'Output Signal',
    font: {
      family: 'Courier New, monospace',
      size: 25
    },
}};

function import_graph(x_point,y_point,y_new_point){ 
var arrayLength = 100
var YArray = []
var Y_newArray =[]
var XArray = []

for(var i = 0; i < arrayLength; i++) {
var y = y_point[i]
var y_new = y_new_point[i]
var x = x_point[i]
YArray[i] = y
Y_newArray[i] = y_new
XArray[i] = x
}

Plotly.newPlot('plot', [{
  x: XArray,
  y: YArray,
  type: 'scatter',
}],layoutinput);  
// Plotly.newPlot('plot', [{
//     x: XArray,
// y: YArray,
// mode: 'scatter',
// line: {color: '#80CAF6'}
// }],layoutinput);
Plotly.newPlot('out_plot', [{
  x:XArray,
  y: Y_newArray,
  mode: 'scatter',
  // line: {color: '#80CAF6'}
}],layoutoutput);

var cnt = 0;

var interval = setInterval(function() {

var y = y_point[100+cnt]
YArray = YArray.concat(y)
YArray.splice(0, 1)
var y_new = y_new_point[100+cnt]
Y_newArray = Y_newArray.concat(y_new)
Y_newArray.splice(0, 1)
var x = x_point[100+cnt]
XArray = XArray.concat(x)
XArray.splice(0, 1)
var data_update = {
  x:[XArray],
  y: [YArray]
};
var new_data_update = {
  x:[XArray],
  y: [Y_newArray]
};
Plotly.update('plot', data_update)
Plotly.update('out_plot', new_data_update)
if(++cnt === 1000) clearInterval(interval);
}, 100); 
  }


  document.getElementById ("import-signal").addEventListener("change", function(){
    if (document.getElementById ("import-signal").value){
        document.getElementById('file_name_of_signal').innerHTML=document.getElementById ("import-signal").value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        document.getElementById('track_pad').style.display = "none"   ;
        // document.getElementById('padreplacement').style.display = "flex"   ;
        var xhr = new XMLHttpRequest();
        const formData = new FormData();
        const files = document.getElementById("import-signal");
        formData.append("imported-signal", files.files[0] );
        xhr.open('POST', '/import_signal', true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                for(let i = 0;i<1000;i++){
                    if (JSON.parse(xhr.response)['y'][i] == JSON.parse(xhr.response)['y_new'][i]){
                    }
                    else{
                        break;
                    }
                  }
                  console.log("before get signal filterd from back ")
                  import_graph(JSON.parse(xhr.response)['x'],JSON.parse(xhr.response)['y'],JSON.parse(xhr.response)['y_new'])

            } else {
                // console.log(xhr.response);
                console.log("done import signal")
            }
        };
        xhr.send(formData);
    }
    else{
        document.getElementById('file_name_of_signal').style.display= 'hidden';
    }
})


//***********************************************************TOGGLE BUTTONS********************** */
const generate = document.getElementById("import-sig");
const csv = document.getElementById("generate-sig");

const div1 = document.getElementById("track_pad");
const div2 = document.getElementById("track");
const div3 = document.getElementById("out-track");

const divA = document.getElementById("plot");
const divB = document.getElementById("out-plot");

const hide = el => el.style.setProperty("display", "none");
const show = el => el.style.setProperty("display", "block");

  hide(csv);


generate.addEventListener("click", () => {
  hide(div1);
  hide(div2);
  hide(div3);
  hide(generate);
  show(csv);
  show(divA);
  show(divB);

});

csv.addEventListener("click", () => {
  hide(csv);
  show(generate);
  show(div1);
  show(div2);
  show(div3);
  hide(divA);
  hide(divB);
});

