alert("How this works\n\nIf you are using this on a mobile device, this version won't work and it's probably best to stop now and go again when you are on a computer.\n\nThe program's main feature is that it allows you to drag and drop an image from your computer onto this window to use the colours from that image.\n\nPlay with the buttons and numbers at the left to see what else you can do to create your image.\n\nYou can save the currently displayed image by clicking on 'Download'. Please note downloading can take a while (and takes longer the larger the number of dots) and currently does not give any feedback other than your browser showing when the file has finished downloading.\n\nThe downloaded file can be opened in a web browser and contains the image in a file format that can be scaled to any size without effecting the quality.\n\nI'd appreciate any comments or thoughts as I develop this. x");


// GLOBAL variables
var dotsBackground = new Raster('mona');//the default image loaded from html page
var dots;// Array to hold the data the dots will be drawn from
var info; // will become dots[0] and hold info about that dot and variables
var drawGroup; // will be the drawing without background
var drawArea;  // used to draw a line around print 
var resizeTimeout;

//Setup variables and event handlers
setInitialState();
//then run onSubmit as if submit button was pressed
onSubmitValues();

// Then all interaction thru web interface 

function setInitialState() {
  console.log("setInitialState");
  // set constants and variables for initisation
  dots = [];
  dots.push({
    rawLen: 10.209636138,
    angle: 352.9003985,
    order: 0,
    unorder: 0,
    monochrome: false,
    ordered: false,
    vis: false,
    jiggle: false,
    warned: false,
    dotColRandomisation: 0,
    phi: 137.507764050037854,
    uniColor: [0.5, 0.5, 0.5],
    num: 0,
    numOld: 1,
    uniSize: 0,
    uniSizeOld: 1,
    uniDrawSize: 0,
    sampleSize: 0,
    viewX: view.bounds.width - 100,
    viewY: view.bounds.height,
  });
  info = dots[0];
  info.origin = new Point(info.viewX / 2, info.viewY / 2);
  //Set background image to fill the bounding rectangle of the view:
  dotsBackground.fitBounds(view.bounds, true);
  // Show the background:
  dotsBackground.visible = info.vis;
  // Add event listners for dropping images, 
  document.addEventListener('drop', onDocumentDrop, false);
  document.addEventListener('dragover', onDocumentDrag, false);
  document.addEventListener('dragleave', onDocumentDrag, false);
  // window resizing,
  window.addEventListener("resize", resizeThrottler, false);
  // document.addEventListener("resize", onResize);
  // console.log("noticed resize");
  // var timeOut = null;
  // if (view.bounds.height !== info.viewboundsY | view.bounds.width !== info.viewboundsX) {
  //   onResize();
  // }
  // buttons for toggling romdomisation and background visibility,
  document.getElementById("ordered").onclick = toggleOrdered;
  document.getElementById("background").onclick = toggleBackground;
  document.getElementById("monochrome").onclick = toggleMonochrome;
  var slider = document.getElementById("slide1");
  console.log("slider");
  slider.oninput = function () {
    info.dotColRandomisation = this.value;
    drawAllDots();
  };


  // submitting new values
  document.getElementById("drawdots").onclick = onSubmitValues;
  document.getElementById("download").onclick = downloadAsSVG;
  // using colour picker
  document.getElementById("colorWell").addEventListener("input", watchColorPicker, false);

  return;
}
function onSubmitValues() {
  // gets and checks input when 'Draw Dots button is pressed'
  // and calls random then draw or set all dots
  console.log("onSubmitValues - calls setRandom and drawAllDots or setAllDrawDots");
  info.num = Number(document.getElementById("dotnum").value);
  info.uniSize = Number(document.getElementById("dotsize").value);
  //Checks values entered dont break program
  if (info.num < 2) {
    console.log("sub- more than 2 dots?");
    info.num = 2;
    document.getElementById("dotnum").value = "2";
    alert("Sorry, the smallest number of dots I work with is 2");
  }
  if (info.uniSize < 1) {
    console.log("sub- size bigger than one?");
    info.uniSize = 1;
    document.getElementById("dotsize").value = "1";
    alert("Sorry, the smallest sized dots I work with is 1");
  }
  // reports if dots overlap
  if (info.uniSize > 902 && info.warned == false) {
    console.log("sub- warned?");
    alert("If the dot size is bigger than 902,\nsome of the dots in the very centre will overlap.\nIf the dot size is over 1000 other dots will overlap\n\nClick 'OK' to continue");
    info.warned = true;
  }
  if (info.num == info.numOld & info.uniSize == info.uniSizeOld) {
    setRandom();
    drawAllDots();
  } else {
    info.numOld = info.num;
    info.uniSizeOld = info.uniSize;
    setAllDrawDots();
  }
  //console.log("sub-submit still - about to call drawDots");
  return;
} // calls other functions and then drawAllDots
function setAllDrawDots() {
  console.log("setAllDrawDots - calls setSpiralData, setSpacing, setDotColSize, setRandom and drawAllDots");
  // setSpiralData = creates array of raw data
  setSpiralData();
  // sets spacing info
  setSpacing();
  //set dots colour and size
  setDotColSize();
  // associate a random dot
  setRandom();
  //call the draw function on the array
  drawAllDots();
  return;
}// calls setSpiralData, setSpacing, setDotColSize, drawAllDots
function setSpiralData() {
  console.log("setSpiralData");
  // Array of generalised raw data for the shape - no scale or colours
  // info.phi = 137.507764050037854 degrees
  // dot 0 already set
  // set the mathematicaly generated position of dots
  for (var k = 1; k < info.num; k++) {
    var rotation = k * info.phi;
    dots[k] = {
      rawLen: Math.sqrt(rotation),
      angle: rotation % 360,
      order: k,
      unorder: k
    };
  };
  return;
}
function setSpacing() {
  console.log("setSpacing");
  // sets len of dots so diameter of image is 95% of smallest side
  var max = 0.5 * Math.floor(Math.min(view.bounds.height, view.bounds.width - 100));
  var maxRadius = dots[info.num - 1].rawLen;
  info.spacing = max / maxRadius * 0.85;
  // Sets the size of the uniSized Dots to be drawn
  info.uniDrawSize = ((info.uniSize - 25) / 100 * info.spacing);
  for (var i = 0; i < info.num; i++) {
    dots[i].len = dots[i].rawLen * info.spacing;
  };
  return;
}
function setDotColSize() {
  console.log("setDotColSize");
  //get colour data and transfer info to monochromeSize
  //Set sample size
  info.sampleSize = info.uniDrawSize;
  if (info.sampleSize < 2) info.sampleSize = 2;
  //loop over objects setting;
  for (var i = 0; i < info.num; i++) {
    var dotCenter = new Point({
      length: dots[i].len,
      angle: dots[i].angle
    });
    var sample = new Path.Circle(info.origin + dotCenter, info.sampleSize);
    // 1. Sample Colour and monochrome Size
    dots[i].picColor = dotsBackground.getAverageColor(sample).components;
    dots[i].monochromeSize = (1 - ((dots[i].picColor[0] + dots[i].picColor[1] + dots[i].picColor[2]) / 3)) * info.uniDrawSize * 1.1;
    sample.remove();
    // 2. Prefilling random fields with non-random data 
  };
  return;
}
function setRandom() {
  console.log("setRandom");
  // Loop over to set unordred dot
  var rand;
  var tempDot;
  for (var i = 0; i < info.num; i++) {
    rand = Math.floor(Math.random() * info.num);
    tempDot = dots[i].unorder;
    dots[i].unorder = dots[rand].unorder;
    dots[rand].unorder = tempDot;
  }
  return;
}
function drawAllDots() {
  console.log("drawAllDots");
  project.activeLayer.removeChildren();
  project.activeLayer.addChild(dotsBackground);
  //Make paperscript group from dots array
  drawGroup = null;
  drawGroup = new Group();
  // var circ = new Path.Circle(info.origin, 25);
  // circ.fillColor = "red";
  for (var i = info.num - 1; i >= 0; i--) {
    var dot = dots[i];
    var dotCenter = new Point({
      length: dot.len,
      angle: dot.angle
    });
    if (!info.ordered) {
      dot = dots[dot.unorder];
    }
    var color = [0, 0, 0]; //= new Colour;
    var size;

    if (info.monochrome) {
      for (n = 0; n < 3; n++) {
        color[n] = info.uniColor[n];
      }
      size = dot.monochromeSize;
    } else {
      for (n = 0; n < 3; n++) {
        color[n] = dot.picColor[n];
      }
      size = info.uniDrawSize;
    }
    if (info.dotColRandomisation < 0.005) {
      info.jiggle = false;
    }
    if (info.dotColRandomisation >= 0.005) {
      info.jiggle = true;
    }

    if (info.jiggle) {
      var randVari = [0, 0, 0];
      var newCol = [0, 0, 0];
      for (n = 0; n < 3; n++) {
        newCol[n] = color[n];
        var upDown = (Math.random() < 0.5) ? -1 : 1;
        randVari[n] = Math.random() * info.dotColRandomisation * upDown;
        newCol[n] = randVari[n] + color[n];
        if (newCol[n] < -1 | newCol[n] > 2) console.log("error in your maths");
        if (newCol[n] < 0) newCol[n] *= -1;
        if (newCol[n] > 1) newCol[n] = 1 - (newCol[n] - 1);
      }
      var jigglecolor = newCol;
    }
    var circ = new Path.Circle(info.origin + dotCenter, size);
    if (info.jiggle) {
      circ.fillColor = jigglecolor;
    } else {
      circ.fillColor = color;
    }
    drawGroup.addChild(circ);
  }
  var borderLen = Math.floor(Math.min(info.viewX, info.viewY));
  var x = info.origin.x - (borderLen / 2);
  var y = info.origin.y - (borderLen / 2);
  drawArea = new Path.Rectangle(x, y, borderLen, borderLen);
  drawArea.strokeColor = "grey";
  drawArea.strokeWidth = 0;
  drawGroup.addChild(drawArea);
  return;
}
function resizeThrottler() {
  // ignore resize events as long as an actualResizeHandler execution is in the queue
  console.log("resizeThrottler");
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null;
      console.log("resizing");
      doResize();
      // The actualResizeHandler will execute at a rate of 15fps
    }, 800);
  }
}// slows down calls to doresize
function doResize() {
  console.log("onResize - calls setSpacing, setDotColSize & drawAllDots");
  // resize and reset rater visability
  dotsBackground.fitBounds(view.bounds, true);
  // reset center
  info.viewX = view.bounds.width - 100;
  info.viewY = view.bounds.height;
  info.origin = new Point(info.viewX / 2, info.viewY / 2);
  setSpacing();
  //set dots colour and size
  setDotColSize();
  //call the draw function on the array
  setRandom();
  drawAllDots();
}// calls setSpacing, setDotColSize, setRandom & drawAllDots
function onDocumentDrop(event) {
  console.log("onDocumentDrop");
  console.log("onDocumentDrop, calls onSubmitValues");
  // when user drops a file into window
  // todo - test file and report if not suitable
  event.preventDefault();
  var file = event.dataTransfer.files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    var image = document.createElement('img');
    image.onload = function () {
      dotsBackground = new Raster(image);
      dotsBackground.fitBounds(view.bounds, true);
      dotsBackground.visible = info.vis;

      setSpacing();
      //set dots colour and size
      setDotColSize();
      //call the draw function on the array
      setRandom();

      drawAllDots();
      // onSubmitValues();
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}// calls setDotColSize & drawAllDots
function toggleOrdered() {
  info.ordered = !info.ordered;
  console.log("toggleOrdered - calls drawAllDots", info.ordered);
  if (!info.ordered) {
    setRandom();
  }
  drawAllDots();
}// calls drawAllDots
function toggleBackground() {
  //toggle background visibility
  info.vis = !info.vis;
  dotsBackground.visible = info.vis;
  console.log("toggleBackground", info.vis);
}
function toggleMonochrome() {
  info.monochrome = !info.monochrome;
  console.log("toggleMonochrome", info.monochrome);
  if (!info.monochrome) {
    document.getElementById("col").classList.add('mono');
    document.getElementById("colorWell").classList.add('mono');
  }
  if (info.monochrome) {
    document.getElementById("col").classList.remove('mono');
    document.getElementById("colorWell").classList.remove('mono');
  }
  drawAllDots();
}// calls drawAllDots
function onDocumentDrag(event) {
  console.log(onDocumentDrag);
  // prevents file being opened by browser
  event.preventDefault();
}
function watchColorPicker(event) {
  console.log("watchColpic");
  info.uniColor = [];
  info.uniColor = hexToRgb(event.target.value).split(',');
  info.uniColor[0] = parseFloat(info.uniColor[0]);
  info.uniColor[1] = parseFloat(info.uniColor[1]);
  info.uniColor[2] = parseFloat(info.uniColor[2]);
  drawAllDots();
}// calls drawAllDots
function downloadAsSVG(fileName) {
  console.log("downloadAsSVG");
  var imageTitle = prompt("Please enter a title for your image");
  var username = prompt("Please enter your name to be added to your image", " ");
  //var temp = imageTitle;;
  var fileName = imageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  drawGroup.bounds.topLeft.x = 0;
  var scale = 1000 / drawGroup.bounds.topRight.x;
  drawGroup.scale(scale);
  drawGroup.bounds.topLeft.x = 0;
  drawGroup.bounds.topLeft.y = 0;
  drawArea.strokeWidth = 0.5;
  if (fileName) {
    fileName = fileName + "_svg.html";
  } else {
    fileName = "Dot Image_svg.html";
  };
  var front = 'data:image/svg+xml;utf8,<!DOCTYPE html><html lang="en"><!-- ***** If you wish to work with the pure SVG - Copy everything between the area marked with five asterix--><head><meta charset="UTF-8" /><title>' + imageTitle + '</title></head><body><div><div style="padding-left:5em"><h1 style="font-family:Helvetica, Sans-Serif">' + imageTitle + '</h1><p><i>' + username + '</i><br><br><br><br></p><!-- If you wish to work with the pure SVG - Copy everything between the area marked with five asterix ie. this point *****--><svg width="1000" height="1000">';
  var back = "</svg><!-- ***** and here --></div><p><br><br><br><br></p></div></body></html>";
  var svg = encodeURIComponent(drawGroup.exportSVG({ embedImages: false, matchShapes: true, asString: true, embedImages: false }));
  var url = front + svg + back;
  // var url = "data:image/svg+xml;utf8," + front + encodeURIComponent(drawGroup.exportSVG({ embedImages: false, matchShapes: true, asString: true, embedImages: false })) + back;
  var link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
  drawAllDots();
}
function hexToRgb(hex) {
  console.log("hexToRgb");
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    c = '0x' + c.join('');
    return [parseFloat(((c >> 16) & 255) / 255), parseFloat(((c >> 8) & 255) / 255), parseFloat((c & 255) / 255)].join(',');
  }
  throw new Error('Bad Hex');
}
