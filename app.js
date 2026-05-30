// app.js



/* CODE POPUP */
$(document).ready(function () {

  // Ouvrir le popup quand on clique sur modifier
  $(".action-btn.edit").on("click", function () {
    $("#popup-modifier-note").addClass("active");
    $("#nouvelle-note").focus();
  });

  // Fermer avec le bouton X
  $("#fermer-popup").on("click", function () {
    $("#popup-modifier-note").removeClass("active");
  });

  // Fermer avec Annuler
  $("#annuler-popup").on("click", function () {
    $("#popup-modifier-note").removeClass("active");
  });

  // Fermer en cliquant sur le fond noir
  $("#popup-modifier-note").on("click", function (e) {
    if (e.target === this) {
      $(this).removeClass("active");
    }
  });

});