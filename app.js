// app.js

$(function () {

  // Index de l'étudiant sélectionné pour modification
  let indexModification = null;

  // ----------------------------------------------------------
  // LOCAL STORAGE
  // ----------------------------------------------------------

  function chargerEtudiants() {
    const data = localStorage.getItem("etudiants");
    return data ? JSON.parse(data) : [];
  }

  function sauvegarderEtudiants(liste) {
    localStorage.setItem("etudiants", JSON.stringify(liste));
  }

  // ----------------------------------------------------------
  // OUTILS
  // ----------------------------------------------------------

  function obtenirDateDuJour() {
    return new Date().toLocaleDateString("fr-FR");
  }

  function obtenirInitiales(nom) {
    return nom
      .trim()
      .split(" ")
      .map(function (mot) {
        return mot[0] ? mot[0].toUpperCase() : "";
      })
      .join("")
      .slice(0, 2);
  }

  function obtenirCouleurAvatar(index) {
    const couleurs = [
      "avatar-blue",
      "avatar-purple",
      "avatar-green",
      "avatar-blue",
      "avatar-purple"
    ];

    return couleurs[index % couleurs.length];
  }

  function obtenirClassesNote(note) {
    if (note < 10) {
      return {
        noteClass: "note-danger",
        badgeClass: "badge-danger",
        badgeTexte: "Très faible"
      };
    }

    if (note < 15) {
      return {
        noteClass: "note-warning",
        badgeClass: "badge-warning",
        badgeTexte: "Passable"
      };
    }

    return {
      noteClass: "note-success",
      badgeClass: "badge-success",
      badgeTexte: "Excellent"
    };
  }

  function formaterNote(note) {
    return Number(note).toString().replace(".", ",");
  }

  // ----------------------------------------------------------
  // ERREURS
  // ----------------------------------------------------------

  function afficherErreur(message) {
    $("#erreur").remove();

    const $erreur = $("<p>")
      .attr("id", "erreur")
      .css({
        color: "#EF4444",
        marginTop: "8px",
        fontSize: "13px",
        fontWeight: "600"
      })
      .text(message);

    $("#formulaire").after($erreur);
  }

  function afficherErreurPopup(message) {
    $(".popup-error").remove();

    const $erreur = $("<p>")
      .addClass("popup-error")
      .css({
        color: "#EF4444",
        marginTop: "10px",
        fontSize: "13px",
        fontWeight: "600"
      })
      .text(message);

    $(".popup-body").append($erreur);
  }

  // ----------------------------------------------------------
  // VALIDATION AJOUT
  // ----------------------------------------------------------

  function validerChamps(nom, noteStr) {
    $("#erreur").remove();

    if (nom.trim() === "") {
      afficherErreur("Le nom de l'étudiant est obligatoire.");
      return false;
    }

    if (noteStr.trim() === "") {
      afficherErreur("La note est obligatoire.");
      return false;
    }

    const note = parseFloat(noteStr);

    if (isNaN(note)) {
      afficherErreur("La note doit être un nombre valide.");
      return false;
    }

    if (note < 0) {
      afficherErreur("La note ne peut pas être inférieure à 0.");
      return false;
    }

    if (note > 20) {
      afficherErreur("La note ne peut pas dépasser 20.");
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  // VALIDATION MODIFICATION
  // ----------------------------------------------------------

  function validerNouvelleNote(noteStr) {
    $(".popup-error").remove();

    if (noteStr.trim() === "") {
      afficherErreurPopup("Veuillez saisir une nouvelle note.");
      return false;
    }

    const note = parseFloat(noteStr);

    if (isNaN(note)) {
      afficherErreurPopup("La note doit être un nombre valide.");
      return false;
    }

    if (note < 0) {
      afficherErreurPopup("La note ne peut pas être inférieure à 0.");
      return false;
    }

    if (note > 20) {
      afficherErreurPopup("La note ne peut pas dépasser 20.");
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  // CONSTRUCTION TABLEAU DESKTOP
  // ----------------------------------------------------------

  function construireLigneTableau(etudiant, index) {
    const initiales = obtenirInitiales(etudiant.nom);
    const couleur = obtenirCouleurAvatar(index);
    const classes = obtenirClassesNote(etudiant.note);

    return $(`
      <tr data-index="${index}">
        <td>
          <div class="student-info">
            <span class="avatar ${couleur}">${initiales}</span>
            <span>${etudiant.nom}</span>
          </div>
        </td>

        <td>
          <span class="note ${classes.noteClass}">
            <span></span>
            ${formaterNote(etudiant.note)}
          </span>
        </td>

        <td>${etudiant.date}</td>

        <td>
          <span class="badge ${classes.badgeClass}">
            ${classes.badgeTexte}
          </span>
        </td>

        <td>
          <div class="action-buttons">
            <button class="action-btn edit" type="button" data-index="${index}">
              <span class="material-symbols-outlined">edit</span>
            </button>

            <button class="action-btn delete" type="button" data-index="${index}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `);
  }

  // ----------------------------------------------------------
  // CONSTRUCTION CARTES MOBILE
  // ----------------------------------------------------------

  function construireCarteMobile(etudiant, index) {
    const initiales = obtenirInitiales(etudiant.nom);
    const couleur = obtenirCouleurAvatar(index);
    const classes = obtenirClassesNote(etudiant.note);

    return $(`
      <article class="student-card-mobile" data-index="${index}">
        <div class="mobile-student-top">
          <div class="student-info">
            <span class="avatar ${couleur}">${initiales}</span>

            <div>
              <h3>${etudiant.nom}</h3>
              <p>Ajouté le ${etudiant.date}</p>
            </div>
          </div>

          <span class="badge ${classes.badgeClass}">
            ${classes.badgeTexte}
          </span>
        </div>

        <div class="mobile-student-bottom">
          <span class="note ${classes.noteClass}">
            <span></span>
            ${formaterNote(etudiant.note)} /20
          </span>

          <div class="action-buttons">
            <button class="action-btn edit" type="button" data-index="${index}">
              <span class="material-symbols-outlined">edit</span>
            </button>

            <button class="action-btn delete" type="button" data-index="${index}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </article>
    `);
  }

  // ----------------------------------------------------------
  // AFFICHAGE
  // ----------------------------------------------------------

  function afficherListe(liste) {
    const $tbody = $(".students-table tbody");
    const $listeMobile = $(".students-mobile-list");

    $tbody.empty();
    $listeMobile.empty();

    if (liste.length === 0) {
      $tbody.append(`
        <tr>
          <td colspan="5" class="empty-row">
            Aucun étudiant trouvé.
          </td>
        </tr>
      `);

      $listeMobile.append(`
        <div class="empty-mobile">
          Aucun étudiant trouvé.
        </div>
      `);

      return;
    }

    $.each(liste, function (index, etudiant) {
      $tbody.append(construireLigneTableau(etudiant, index));
      $listeMobile.append(construireCarteMobile(etudiant, index));
    });
  }

  // ----------------------------------------------------------
  // RECHERCHE
  // ----------------------------------------------------------

  function rechercherEtudiants(texteRecherche) {
    const liste = chargerEtudiants();
    const recherche = texteRecherche.trim().toLowerCase();

    if (recherche === "") {
      afficherListe(liste);
      return;
    }

    const resultats = liste.filter(function (etudiant) {
      return (
        etudiant.nom.toLowerCase().includes(recherche) ||
        String(etudiant.note).includes(recherche) ||
        etudiant.date.toLowerCase().includes(recherche)
      );
    });

    afficherListe(resultats);
  }

  $(".search-bar input").on("input", function () {
    const texteRecherche = $(this).val();
    rechercherEtudiants(texteRecherche);
  });

  $(".search-clear").on("click", function () {
    $(".search-bar input").val("");
    afficherListe(chargerEtudiants());
    $(".search-bar input").focus();
  });

  // ----------------------------------------------------------
  // AJOUT ÉTUDIANT
  // ----------------------------------------------------------

  $("#btn-ajouter").on("click", function () {
    const nom = $("#nom").val();
    const noteStr = $("#note").val();

    if (!validerChamps(nom, noteStr)) {
      return;
    }

    $("#erreur").remove();

    const liste = chargerEtudiants();

    const nouvelEtudiant = {
      nom: nom.trim(),
      note: parseFloat(noteStr),
      date: obtenirDateDuJour()
    };

    liste.push(nouvelEtudiant);

    sauvegarderEtudiants(liste);
    afficherListe(liste);

    $(".search-bar input").val("");

    $("#nom").val("").focus();
    $("#note").val("");
  });

  // ----------------------------------------------------------
  // SUPPRESSION ÉTUDIANT
  // ----------------------------------------------------------

  $(document).on("click", ".action-btn.delete", function () {
    const index = parseInt($(this).data("index"));
    const liste = chargerEtudiants();

    liste.splice(index, 1);

    sauvegarderEtudiants(liste);

    const recherche = $(".search-bar input").val();

    if (recherche.trim() !== "") {
      rechercherEtudiants(recherche);
    } else {
      afficherListe(liste);
    }
  });

  // ----------------------------------------------------------
  // OUVERTURE POPUP MODIFICATION
  // ----------------------------------------------------------

  $(document).on("click", ".action-btn.edit", function () {
    indexModification = parseInt($(this).data("index"));

    const liste = chargerEtudiants();
    const etudiant = liste[indexModification];

    if (!etudiant) {
      return;
    }

    $("#nouvelle-note").val(etudiant.note);
    $(".popup-error").remove();

    $("#popup-modifier-note").addClass("active");

    setTimeout(function () {
      $("#nouvelle-note").focus();
    }, 100);
  });

  // ----------------------------------------------------------
  // MODIFICATION NOTE
  // ----------------------------------------------------------

  $(".btn-valider").on("click", function () {
    const nouvelleNoteStr = $("#nouvelle-note").val();

    if (!validerNouvelleNote(nouvelleNoteStr)) {
      return;
    }

    const liste = chargerEtudiants();

    if (indexModification === null || !liste[indexModification]) {
      afficherErreurPopup("Impossible de retrouver l'étudiant à modifier.");
      return;
    }

    liste[indexModification].note = parseFloat(nouvelleNoteStr);

    sauvegarderEtudiants(liste);

    const recherche = $(".search-bar input").val();

    if (recherche.trim() !== "") {
      rechercherEtudiants(recherche);
    } else {
      afficherListe(liste);
    }

    fermerPopupModification();
  });

  // ----------------------------------------------------------
  // FERMETURE POPUP
  // ----------------------------------------------------------

  function fermerPopupModification() {
    $("#popup-modifier-note").removeClass("active");
    $("#nouvelle-note").val("");
    $(".popup-error").remove();
    indexModification = null;
  }

  $("#fermer-popup").on("click", function () {
    fermerPopupModification();
  });

  $("#annuler-popup").on("click", function () {
    fermerPopupModification();
  });

  $("#popup-modifier-note").on("click", function (e) {
    if (e.target === this) {
      fermerPopupModification();
    }
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      fermerPopupModification();
    }
  });

  // ----------------------------------------------------------
  // INITIALISATION
  // ----------------------------------------------------------

  afficherListe(chargerEtudiants());

});