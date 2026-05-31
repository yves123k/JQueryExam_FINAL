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

// AJOUT & SUPPRESSION — (Responsable : Sebo)


$(function () {

  // ----------------------------------------------------------
  // FONCTIONS UTILITAIRES
  // ----------------------------------------------------------

  /**
   * Charge le tableau des étudiants depuis le LocalStorage.
   * Retourne un tableau vide si aucune donnée n'existe encore.
   * @returns {Array}
   */
  function chargerEtudiants() {
    const data = localStorage.getItem("etudiants");
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde le tableau des étudiants dans le LocalStorage.
   * @param {Array} liste - Le tableau d'objets étudiants
   */
  function sauvegarderEtudiants(liste) {
    localStorage.setItem("etudiants", JSON.stringify(liste));
  }

  /**
   * Formate la date du jour en format français : jj/mm/aaaa
   * @returns {string}
   */
  function obtenirDateDuJour() {
    return new Date().toLocaleDateString("fr-FR");
  }

  /**
   * Génère les initiales d'un nom (ex: "Ali Ben" → "AB").
   * @param {string} nom
   * @returns {string}
   */
  function obtenirInitiales(nom) {
    return nom
      .trim()
      .split(" ")
      .map(function (mot) { return mot[0] ? mot[0].toUpperCase() : ""; })
      .join("")
      .slice(0, 2);
  }

  /**
   * Retourne la classe CSS de couleur d'avatar selon l'index de l'étudiant.
   * Les classes disponibles sont définies dans style.css.
   * @param {number} index
   * @returns {string}
   */
  function obtenirCouleurAvatar(index) {
    const couleurs = ["avatar-blue", "avatar-purple", "avatar-green", "avatar-orange", "avatar-red"];
    return couleurs[index % couleurs.length];
  }

  /**
   * Retourne les classes CSS et le texte du badge selon la note.
   * Règle : note < 10 → danger, 10 ≤ note < 15 → warning, note ≥ 15 → success
   * @param {number} note
   * @returns {{ noteClass: string, badgeClass: string, badgeTexte: string }}
   */
  function obtenirClassesNote(note) {
    if (note < 10) {
      return { noteClass: "note-danger",  badgeClass: "badge-danger",  badgeTexte: "Très faible" };
    } else if (note < 15) {
      return { noteClass: "note-warning", badgeClass: "badge-warning", badgeTexte: "Passable"    };
    } else {
      return { noteClass: "note-success", badgeClass: "badge-success", badgeTexte: "Excellent"   };
    }
  }

  // ----------------------------------------------------------
  // VALIDATION DES CHAMPS
  // ----------------------------------------------------------

  /**
   * Vérifie que les champs nom et note sont correctement remplis.
   *
   * Règles appliquées :
   *  - Le nom ne doit pas être vide
   *  - La note ne doit pas être vide
   *  - La note doit être un nombre valide
   *  - La note ne doit pas être inférieure à 0
   *  - La note ne doit pas dépasser 20
   *
   * @param {string} nom      - Valeur brute du champ #nom
   * @param {string} noteStr  - Valeur brute du champ #note
   * @returns {boolean} true si tout est valide, false sinon
   */
  function validerChamps(nom, noteStr) {

    // Supprimer l'ancien message d'erreur avant de revalider
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

  /**
   * Insère un message d'erreur rouge sous le formulaire.
   * @param {string} message
   */
  function afficherErreur(message) {
    const $erreur = $("<p>")
      .attr("id", "erreur")
      .css({ color: "red", marginTop: "8px", fontSize: "0.875rem" })
      .text(message);

    $("#formulaire").after($erreur);
  }

  // ----------------------------------------------------------
  // CONSTRUCTION DES LIGNES HTML
  // ----------------------------------------------------------

  /**
   * Construit un <tr> pour la version tableau desktop.
   * @param {Object} etudiant - { nom, note, date }
   * @param {number} index    - Position dans le tableau (pour data-index)
   * @returns {jQuery} élément <tr>
   */
  function construireLigneTableau(etudiant, index) {
    const initiales = obtenirInitiales(etudiant.nom);
    const couleur   = obtenirCouleurAvatar(index);
    const classes   = obtenirClassesNote(etudiant.note);

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
            ${etudiant.note}
          </span>
        </td>
        <td>${etudiant.date}</td>
        <td>
          <span class="badge ${classes.badgeClass}">${classes.badgeTexte}</span>
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

  /**
   * Construit un <article> pour la version mobile.
   * @param {Object} etudiant - { nom, note, date }
   * @param {number} index    - Position dans le tableau (pour data-index)
   * @returns {jQuery} élément <article>
   */
  function construireCarteMobile(etudiant, index) {
    const initiales = obtenirInitiales(etudiant.nom);
    const couleur   = obtenirCouleurAvatar(index);
    const classes   = obtenirClassesNote(etudiant.note);

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
          <span class="badge ${classes.badgeClass}">${classes.badgeTexte}</span>
        </div>
        <div class="mobile-student-bottom">
          <span class="note ${classes.noteClass}">
            <span></span>
            ${etudiant.note} /20
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
  // AFFICHAGE DE LA LISTE
  // ----------------------------------------------------------

  /**
   * Vide et reconstruit les deux vues (tableau + mobile)
   * à partir du tableau des étudiants.
   * @param {Array} liste - Tableau d'objets étudiants
   */
  function afficherListe(liste) {
    const $tbody       = $(".students-table tbody");
    const $listeMobile = $(".students-mobile-list");

    $tbody.empty();
    $listeMobile.empty();

    $.each(liste, function (index, etudiant) {
      $tbody.append(construireLigneTableau(etudiant, index));
      $listeMobile.append(construireCarteMobile(etudiant, index));
    });
  }

  // ----------------------------------------------------------
  // AJOUT D'UN ÉTUDIANT
  // ----------------------------------------------------------

  /**
   * Gère le clic sur le bouton "Ajouter".
   * Valide les champs, crée un objet étudiant,
   * l'ajoute au tableau, sauvegarde dans LocalStorage
   * et rafraîchit les deux vues.
   */
  $("#btn-ajouter").on("click", function () {
    const nom     = $("#nom").val();
    const noteStr = $("#note").val();

    // Arrêt si la validation échoue
    if (!validerChamps(nom, noteStr)) {
      return;
    }

    // Suppression du message d'erreur si la saisie est correcte
    $("#erreur").remove();

    const liste = chargerEtudiants();

    // Création de l'objet étudiant
    const nouvelEtudiant = {
      nom:  nom.trim(),
      note: parseFloat(noteStr),
      date: obtenirDateDuJour()
    };

    liste.push(nouvelEtudiant);
    sauvegarderEtudiants(liste);
    afficherListe(liste);

    // Réinitialisation du formulaire
    $("#nom").val("").focus();
    $("#note").val("");
  });

  // ----------------------------------------------------------
  // SUPPRESSION D'UN ÉTUDIANT
  // ----------------------------------------------------------

  /**
   * Délégation d'événement sur le document pour intercepter
   * les clics sur les boutons Supprimer (.action-btn.delete).
   * Récupère l'index via data-index, supprime l'étudiant,
   * sauvegarde et rafraîchit les deux vues.
   */
  $(document).on("click", ".action-btn.delete", function () {
    const index = parseInt($(this).data("index"));
    const liste = chargerEtudiants();

    // Suppression de l'élément à l'index donné
    liste.splice(index, 1);

    sauvegarderEtudiants(liste);
    afficherListe(liste);
  });

  // ----------------------------------------------------------
  // INITIALISATION : charger les données existantes au démarrage
  // ----------------------------------------------------------
  afficherListe(chargerEtudiants());

}); // fin $(function)