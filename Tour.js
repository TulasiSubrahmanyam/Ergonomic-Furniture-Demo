//Tour

var modal = document.getElementById("myModalTour");
var btn = document.getElementById("Tour");
var span = document.getElementById("closeTour");

function buttonClick(){
btn.onclick=function(){
modal.style.display="block";
}
span.onclick=function(){
    modal.style.display="none";
}
  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
  export{buttonClick};