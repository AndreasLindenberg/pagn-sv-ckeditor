/**
 * This file is part of SV-Tool-Editor.
 * Copyright (C) 2025 Andreas Lindenberg <lindenberg@abendgymnasien.de>
 *
 * SV-Tool-Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SV-Tool-Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SV-Tool-Editor. If not, see <https://www.gnu.org/licenses/>.
 */

import { editorCreate
    , editorDestroy
    , editorCheckStatus
    , editorGetData
    , editorSetData
    , editorSetReadOnly
    , editorInsertHTML
    , editorInsertText
    , editorAdjustSize
    , editorSetVisible
} from 'pageditor';

/***************************************************************************************************************************************************/

export function setupEventHandlers(zielgruppe, betrachtertyp, betrachterid) {
    // Event-Listener für die Schaltflächen
    document.querySelector('#mailSpeichern').addEventListener('click', () => {
        if (editorCheckStatus('ready')) {
            // HTML-Inhalt abrufen
            let editorData = editorGetData();

            // Speichern mit eingebetteten Stilen
            onSpeichern(editorData, 1, zielgruppe, betrachtertyp, betrachterid);
        }
    });

    document.querySelector('#mailAbschicken').addEventListener('click', () => {
        if (editorCheckStatus('ready')) {
            // HTML-Inhalt abrufen
            let editorData = editorGetData();

            // Speichern mit eingebetteten Stilen
            onSpeichern(editorData, 2, zielgruppe, betrachtertyp, betrachterid);
        }
    });

    document.querySelector('#mailTesten').addEventListener('click', () => {
        if (editorCheckStatus('ready')) {
            // HTML-Inhalt abrufen
            let editorData = editorGetData();

            // Speichern mit eingebetteten Stilen
            onSpeichern(editorData, 3, zielgruppe, betrachtertyp, betrachterid);
        }
    });
}

/***************************************************************************************************************************************************/
// onSpeichern speichert eine E-Mail samt Betreffzeile ab, falls status == 1.
// Ist status == 2 wird sie zusätzlich an die Zielgruppe geschickt, bei Studierenden ggfs an die unterrichtenden Kollegen der Klasse 
// und an ggfs. weitere CC-Gruppen abgeschickt.
// status == 3: Die Mail wird gespeichert und nur an den Verfasser (zum Testen) verschickt, der Maileditor wird nicht geschlossen.

async function onSpeichern(mailtext, status, zielgruppe, betrachtertyp, betrachterid) {
    // Es müssen eine Betreffzeile und ein Mailtext eingegeben sein, sonst speichern wir nicht.
    // Betreffzeile?
    let betreff = document.getElementById("betreff").value;
    if (betreff === '') {
        alert("Der Betreff der E-Mail kann nicht leer sein!");
        return;
    }
    if (mailtext === '') {
        alert("Die Mail hat keinen Inhalt, sie wird nicht gespeichert!");
        return;
    }

    let spinnergestartet = false;

    try {
        // An welche E-Mail-adresse darf der Empfänger antworten?
        let antwortmailadresse = '';
        if (document.getElementById("antwortmail") && document.getElementById("antwortmail")) {
            // Checkbox für Antwortmail ist nur für Lehrkräfte und Admins sichtbar und auch angehakt.
            if (betrachtertyp === 'L') {
                // Lehrkräfte haben bis zu zwei E-Mail-Adressen, die in einem Menü angezeigt werden.
                antwortmailadresse = document.getElementById("lkmailmenu").value;
            } else if (betrachtertyp === 'A') {
                // Admins können ihre eigene Mailadresse hinterlegen.
                antwortmailadresse = document.getElementById("lkantwortmail").innerText;
            }
        }

        const maildata = { betreff: betreff
                            , mailtext: mailtext
                            , zielgruppe: zielgruppe
                            , mailid: parseInt(document.getElementById("mailSpeichern").dataset.mailid)     // Falls mailid = 0 ist, wird die Mail neu angelegt.
                            , klasseid: 0
                            , adressaten: 0
                            , fachid: 0
                            , cckollegen: 0
                            , ccschulleitung: (document.getElementById("ccschulleitung").checked) ? 1 : 0
                            , ccservicecenter: (document.getElementById("ccservicecenter").checked) ? 1 : 0
                            , status: status
                            , antwortmailadresse: antwortmailadresse
                            };

        if (zielgruppe === 'S') {
            // Zielgruppe: Studierende
            // Welche Klasse?
            const klmenu = document.getElementById("klmenu");
            maildata.klasseid = parseInt(klmenu.value);

            // Kopie an Kollegen?
            maildata.cckollegen = (document.getElementById("cckollegen").checked) ? 1 : 0;
        } else {
            // Zielgruppe: Lehrkräfte
            const item = zielgruppenmenu.options[zielgruppenmenu.selectedIndex];
            maildata.adressaten = item.dataset.adressaten;
            maildata.klasseid = parseInt(item.dataset.klasseid);
            maildata.fachid = parseInt(item.dataset.fachid);
        }

        // Das Verschicken von Mails kann einige Sekunden dauern - so lange lassen wir einen erneuten Klick auf die Buttons nicht zu.
        document.getElementById("mailSpeichern").disabled = true;
        document.getElementById("mailAbschicken").disabled = true;
        document.getElementById("mailTesten").disabled = true;
        document.getElementById("mailAbbrechen").disabled = true;

        // Falls wir Anhänge haben, zeigen wir immer den Spinner, da der Versand dann länger dauert.
        const filebut = document.getElementById("file");
        const anhanggroesse = parseInt(filebut.dataset.anhanggroesse);

        // Spinning starten
        if (status === 2 || status === 3 && anhanggroesse > 0) {
            if (status === 2)
                spinningMeldung(`E-Mails werden einzeln an die ${zielgruppe === 'S' ? 'Studierenden' : 'Lehrkräfte'} versendet.`);
            else
                spinningMeldung(`E-Mail wird zur Überprüfung an Sie versendet.`);
            onSpinningStarten('editorDialog');
            spinnergestartet = true;
        }

        let url = new URL("json/json_mailings.php", window.location.origin + "/pagn-sv/");
        url.searchParams.append('aktion', 'JSONMailSenden');

        const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify(maildata)
            });
        if (!response.ok) {
            throw new Error(`Netzwerkfehler in JSONMailSenden: ${response.status} (${response.statusText})`);
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        // Spinning beenden
        if (spinnergestartet) {
            onSpinningBeenden('editorDialog');
            spinnergestartet = false;
        }

        if (status === 1)
            alert("Die E-Mail wurde gespeichert. Bis zum endgüligen Versand bleibt sie für andere Personen unsichtbar.");

        if (status === 2)
            alert("Die E-Mail wurde erfolgreich versendet. Sie haben eine Kopie der E-Mail erhalten.");

        if (status === 3) {
            // Mail wurde nur an den Verfasser zum Testen verschickt. Editor bleibt geöffnet.
            alert("Die E-Mail wurde gespeichert und erfolgreich an Sie versendet. Bis zum endgüligen Versand bleibt sie für andere Personen unsichtbar.");
            // Welche id hat die Mail bekommen? Ist nur hier wichtig, weil hier der Dialog offenbleibt.
            document.getElementById("mailSpeichern").dataset.mailid = result.mailid;
        } else {
            // Editor schließen.
            onNeueEMailDialogBeenden();
        }

        mailingListeSetup(zielgruppe, betrachtertyp, betrachterid);
    } catch (err) {
        alert("Fehler aufgetreten:\n\n" + err.message);
    } finally {
        // Spinning beenden
        if (spinnergestartet) {
            onSpinningBeenden('editorDialog');
        }

        // Buttons wieder zulassen
        document.getElementById("mailSpeichern").disabled = false;
        document.getElementById("mailAbschicken").disabled = false;
        document.getElementById("mailTesten").disabled = false;
        document.getElementById("mailAbbrechen").disabled = false;
    }
}

/***************************************************************************************************************************************************/
// nurzeigen: true: Der Editor wird nur zur Anzeige einer E-Mail gestartet, editieren ist nicht möglich.

export function onNeueEMailDialogStarten(zielgruppe, fensterhöheanpassen = true) {
    return new Promise((resolve, reject) => {
        // Der Editor wird sichtbar gemacht.
        // Die Breite des editorDialog auf die Breite der Menubar setzen.
        const editorDialog = document.getElementById('editorDialog');
        editorDialog.style.width = getMenubarBreite() + 'px';

        // Studierende können keine Mails editieren, wir brauchen den Editor nur für Lehrkräfte und admins.
        editorSetVisible(true, 'mailingTable');
        
        editorCreate()
        .then(() => {
            // Alle Felder des Editors aktivieren
            editorSetReadOnly(false);

            // Alle Inhalte löschen, da der Editor auf HTML-Basis arbeitet, setzen wir den Inhalt auf '<p>&nbsp;</p>'
            document.getElementById("betreff").value = "";
            editorSetData('<p>&nbsp;</p>');

            if (zielgruppe === 'S') {
                // An welche Klasse soll die Mail geschickt werden?
                const klmenu = document.getElementById("klmenu");
                document.getElementById("adressat").innerText = klmenu.options[klmenu.selectedIndex].dataset.vollerklassenname;
            } else {
                // Zielgruppe: Lehrkräfte, Betrachtertypen können nur 'L' oder 'A' sein
                // Welches sind denn die Adressaten?
                const zielgruppenmenu = document.getElementById("zielgruppenmenu");
                document.getElementById("adressat").innerText = zielgruppenmenu.options[zielgruppenmenu.selectedIndex].innerText;
            }

            document.getElementById("betreff").disabled = false;
            document.getElementById("mailSpeichern").disabled = false;
            document.getElementById("mailAbschicken").disabled = false;
            document.getElementById("mailTesten").disabled = false;

            // Neue Mails haben noch keine id.
            document.getElementById("mailSpeichern").dataset.mailid = 0;

            // Wir setzen das Tokenmenü auf die erste Position
            const tokenmenu = document.getElementById("tokenmenu");
            tokenmenu.selectedIndex = 0;

            // Höhe des Editierdialogs anpassen
            if (fensterhöheanpassen)
                editorAdjustSize();

            resolve();
        })
        .catch(err => {
            reject(err);
        });
    });
}

/***************************************************************************************************************************************************/
// onURLeinfügen setzt an die Cursorposition die angezeigte URL ein.

export function onURLeinfügen() {
    const urlmenu = document.getElementById("urlmenu");
    editorInsertHTML(urlmenu.value + '  ');
}

/***************************************************************************************************************************************************/
// onTokenSetzen setzt an die (letzte) Position des Cursors das ausgewählte Token ein.

export function onTokenSetzen(token) {
    if (token !== '') {
        editorInsertText(`%${token}%`);
    }
}

/***************************************************************************************************************************************************/

export function onNeueEMailDialogBeenden() {
    // Der Dialog wird wieder unsichtbar gemacht.
    editorSetVisible(false, 'mailingTable');

    // Den Editor räumen
    if (editorCheckStatus('ready')) {
        editorDestroy();
    }
}

/***************************************************************************************************************************************************/

export function insertEditorIntoContainerByID(maincontainerid) {
    // Erzeugt das DOM-Element des Editors, welches dann in den Container eingesetzt werden kann.
    // Create the main container div
    const container = document.createElement('div');
    container.className = 'editor-container editor-container_classic-editor editor-container_include-style';
    container.id = 'editor-container';
    
    // Create the inner container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container__editor';
    
    // Create the editor div
    const editor = document.createElement('div');
    editor.id = 'editor';
    
    // Build the DOM structure
    editorContainer.appendChild(editor);
    container.appendChild(editorContainer);

    // Insert the editor into the specified main container
    const mainContainer = document.getElementById(maincontainerid);
    if (mainContainer) {
        mainContainer.appendChild(container);
    }
}

/***************************************************************************************************************************************************/

export function onAbmelden(action) {
    // Der Editor wird verlassen, wir räumen auf.
    if (editorCheckStatus('ready')) {
        editorDestroy()
        .finally(() => { window.location.href = action; });
    } else {
        // Zurück zum Hauptmenü oder zur Anmeldeseite.
        window.location.href = action;
    }
}

/***************************************************************************************************************************************************/

