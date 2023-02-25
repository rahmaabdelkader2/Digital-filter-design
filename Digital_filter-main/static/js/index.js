const filterDesignMagnitude = document.querySelector('#filter-mag-response')
const filterDesignPhase = document.querySelector('#filter-phase-response')
const allPassPhase = document.getElementById('all-pass-phase-response');
const finalPhase = document.getElementById('final-filter-phase-response');
const checkList = document.getElementById('list1');
const zero_mode_btn = document.getElementById("zero")
const pole_mode_btn = document.getElementById("pole")
const modes_btns = [zero_mode_btn, pole_mode_btn]

document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff)
document.querySelector('#new-all-pass-coef').addEventListener('click', addNewA)

clearCheckBoxes()


async function updateFilterDesign(data) {
    data.gain = 1
}

checkList.getElementsByClassName('anchor')[0].onclick = function () {
    if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
    else
        checkList.classList.add('visible');
}


function addNewA() {
    var newA = document.getElementById('new-value').value
    if(newA > 1 || newA < -1){
        return
    }
    document.getElementById(
        'listOfA'
    ).innerHTML += `<li><input class = "target1" type="checkbox" data-avalue="${newA}"/>${newA}</li>`
    clearCheckBoxes()
}

function updateFilterPhase(allPassCoeff){
    const { zeros, poles } = filter_plane.getZerosPoles(radius)
    var data__send={'allpass':allPassCoeff}
    $.ajax({
        url: "/allpass",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data__send),
        success: function (response) {
            console.log("done response for all pass")
            Plotly.newPlot('all-pass-phase-response', [{
                x: JSON.parse(response)['frequency'],
                y: JSON.parse(response)['phase'],
                type: 'scatter'
            }]);   
        },
    });
    var data_send={'zero':zeros,'pole':poles,'a':allPassCoeff}
    $.ajax({
        url: "/applyallpass",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data_send),
        success: function (response) {
            console.log("done response for all pass")
            Plotly.newPlot('final-filter-phase-response', [{
                x: JSON.parse(response)['frequency'],
                y: JSON.parse(response)['phase'],
                type: 'scatter'
                
            }]);   
            Plotly.newPlot('filter-phase-response', [{
                x: JSON.parse(response)['frequency'],
                y: JSON.parse(response)['phase'],
                type: 'scatter'
                
            }]);   
        },
    });
    
}

function updateFilterPlotting(w, allPassAngels, finalFilterPhase){
    plotlyMultiLinePlot(allPassPhase, [{x: w, y: allPassAngels}])
    plotlyMultiLinePlot(finalPhase, [{x: w, y: finalFilterPhase}])
}

function plotlyMultiLinePlot(container, data){
    Plotly.newPlot(
        container,
        data,
        {
            margin: { l: 30, r: 0, b: 30, t: 0 },
            xaxis: {
                autorange: true,
                tickfont: { color: '#8a888976' },
            },
            yaxis: {
                autorange: true,
                tickfont: { color: '#8a888976' },
            },
            plot_bgcolor: '#8a888976',
            paper_bgcolor: '#8a888976',
        },
        { staticPlot: true }
    )
}

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value
    })
}

function updateAllPassCoeff(){
    let allPassCoeff = []
    document.querySelectorAll('.target1').forEach(item => {
        let aValue = parseFloat(item.dataset.avalue)
        let checked = item.checked
        if (checked) allPassCoeff.push(aValue)
    })
    updateFilterPhase(allPassCoeff)
}

function clearCheckBoxes(){
    document.querySelectorAll('.target1').forEach(item => {
        item.checked = false;
    })
}

function changeMode(e){
    unit_circle_mode = modesMap[e.target.id]
    for(btn of modes_btns){
        btn.style.color = (btn !== e.target) ? "#fff" : "#8a888976";
    }
}


// carousek    
    const carousel = document.querySelector(".carousel"),
    firstImg = carousel.querySelectorAll("img")[0],
    arrowIcons = document.querySelectorAll(".wrapper i");

    let isDragStart = false, isDragging = false, prevPageX, prevScrollLeft, positionDiff;

    const showHideIcons = () => {
        // showing and hiding prev/next icon according to carousel scroll left value
        let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
        arrowIcons[0].style.display = carousel.scrollLeft == 0 ? "none" : "block";
        arrowIcons[1].style.display = carousel.scrollLeft == scrollWidth ? "none" : "block";
    }

    arrowIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            let firstImgWidth = firstImg.clientWidth + 14; // getting first img width & adding 14 margin value
            // if clicked icon is left, reduce width value from the carousel scroll left else add to it
            carousel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
            setTimeout(() => showHideIcons(), 60); // calling showHideIcons after 60ms
        });
    });

    const autoSlide = () => {
        // if there is no image left to scroll then return from here
        if(carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 || carousel.scrollLeft <= 0) return;

        positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
        let firstImgWidth = firstImg.clientWidth + 14;
        // getting difference value that needs to add or reduce from carousel left to take middle img center
        let valDifference = firstImgWidth - positionDiff;

        if(carousel.scrollLeft > prevScrollLeft) { // if user is scrolling to the right
            return carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
        }
        // if user is scrolling to the left
        carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }

    const dragStart = (e) => {
        // updatating global variables value on mouse down event
        isDragStart = true;
        prevPageX = e.pageX || e.touches[0].pageX;
        prevScrollLeft = carousel.scrollLeft;
    }

    const dragging = (e) => {
        // scrolling images/carousel to left according to mouse pointer
        if(!isDragStart) return;
        e.preventDefault();
        isDragging = true;
        carousel.classList.add("dragging");
        positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
        carousel.scrollLeft = prevScrollLeft - positionDiff;
        showHideIcons();
    }

    const dragStop = () => {
        isDragStart = false;
        carousel.classList.remove("dragging");

        if(!isDragging) return;
        isDragging = false;
        autoSlide();
    }

    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("touchstart", dragStart);

    document.addEventListener("mousemove", dragging);
    carousel.addEventListener("touchmove", dragging);

    document.addEventListener("mouseup", dragStop);
    carousel.addEventListener("touchend", dragStop);


document.getElementById('img1').addEventListener('mouseover',function (){
      document.getElementById('info').style.display = 'block';
  document.getElementById('info').innerHTML = 'Coff -0.9'
})
// document.getElementById('img1').addEventListener('mouseout',function (){
//       document.getElementById('info').style.display = 'none';

// })
document.getElementById('img2').addEventListener('mouseover',function (){
      document.getElementById('info').style.display = 'block';
  document.getElementById('info').innerHTML = 'Coff -0.495'
})
// document.getElementById('img2').addEventListener('mouseout',function (){
//       document.getElementById('info').style.display = 'none';

// })
document.getElementById('img3').addEventListener('mouseover',function (){
      document.getElementById('info').style.display = 'block';
  document.getElementById('info').innerHTML = 'Coff 0.45'
})
// document.getElementById('img3').addEventListener('mouseout',function (){
//       document.getElementById('info').style.display = 'none';

// })
document.getElementById('img4').addEventListener('mouseover',function (){
      document.getElementById('info').style.display = 'block';
  document.getElementById('info').innerHTML = 'Coff 0.99'
})
// document.getElementById('img4').addEventListener('mouseout',function (){
//       document.getElementById('info').style.display = 'none';

// })
document.getElementById('img5').addEventListener('mouseover',function (){
    document.getElementById('info').style.display = 'block';
    document.getElementById('info').innerHTML = 'Coff 0.0'
})
// document.getElementById('img5').addEventListener('mouseout',function (){
//     document.getElementById('info').style.display = 'none';

// })

