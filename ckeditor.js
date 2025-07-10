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

/***************************************************************************************************************************************************/

let editor = null;

import {
    ClassicEditor,
    Alignment,
    Autoformat,
    AutoImage,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    Bookmark,
    CloudServices,
    CodeBlock,
    Essentials,
    GeneralHtmlSupport,
    Heading,
    HorizontalLine,
    ImageBlock,
    ImageCaption,
    ImageInsert,
    ImageInline,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    Paragraph,
    SimpleUploadAdapter,
    Style,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    // TodoList,
    Underline
} from 'ckeditor5';

/***************************************************************************************************************************************************/
// zielgruppe: L oder S: Werden die Mails für Lehrkräfte oder für Studierende bearbeitet?
// betrachtertyp: S, L, oder A: Person aus welcher Gruppe sitzt gerade vor dem Computer?
// betrachterid: Welche Person konkret?

export function editorCreate() {
    return new Promise((resolve, reject) => {
        let uploadsurl = new URL("json/json_ckeditoruploads.php", window.location.origin + "/pagn-sv/");

        ClassicEditor
            .create(document.querySelector('#editor'), {
                toolbar: {
                    items: [ 'heading'
                        , '|', 'bold', 'italic', 'underline'
                        , '|', 'horizontalLine'
                        , '|', 'link', 'insertTable', 'insertImage', 'codeBlock'
                        , '|', 'alignment', 'bulletedList', 'numberedList', 'blockQuote'
                        , '|', 'undo', 'redo'
                        ]
                },
                plugins: [
                    Alignment,
                    Autoformat,
                    AutoImage,
                    AutoLink,
                    Autosave,
                    BlockQuote,
                    Bold,
                    CloudServices,
                    CodeBlock,
                    Essentials,
                    GeneralHtmlSupport,
                    Heading,
                    HorizontalLine,
                    ImageBlock,
                    ImageCaption,
                    ImageInline,
                    ImageInsert,
                    ImageInsertViaUrl,
                    ImageResize,
                    ImageStyle,
                    ImageTextAlternative,
                    ImageToolbar,
                    ImageUpload,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    LinkImage,
                    List,
                    ListProperties,
                    // Markdown,            Das Ergebnis bei editor.getData() wäre im MarkDown-Format. Dabei gehen einige Formatierungen verloren.
                    Paragraph,
                    // PasteFromMarkdownExperimental,
                    SimpleUploadAdapter,
                    Style,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextTransformation,
                    // TodoList,
                    Underline
                ],
                heading: {
                    options: [{
                            model: 'paragraph',
                            title: 'Absatz',
                            class: 'ck-heading_paragraph'
                        },
                        {
                            model: 'heading1',
                            view: 'h1',
                            title: 'Überschrift groß',
                            class: 'ck-heading_heading1'
                        },
                        {
                            model: 'heading2',
                            view: 'h2',
                            title: 'Überschrift mittel',
                            class: 'ck-heading_heading2'
                        },
                        {
                            model: 'heading3',
                            view: 'h3',
                            title: 'Überschrift klein',
                            class: 'ck-heading_heading3'
                        }
                    ]
                },
                htmlSupport: {
                    allow: [
                        {
                            name: /^.*$/,
                            styles: true,
                            attributes: true,
                            classes: true
                        },
                        {
                            name: 'img',
                            attributes: true,
                            styles: true,
                            classes: true
                        }
                    ]
                },
                image: {
                    toolbar: [
                        'imageTextAlternative',
                        'toggleImageCaption',
                        '|',
                        'resizeImage:25',
                        'resizeImage:50',
                        'resizeImage:75',
                        'resizeImage:original',
                        'resizeImage:custom',
                        '|',
                        'imageStyle:inline',
                        'imageStyle:block',
                        'imageStyle:side',
                        'imageStyle:alignLeft',
                        'imageStyle:alignRight',
                        'imageStyle:alignCenter'
                    ],
                    styles: {
                        alignLeft: {
                            name: 'Align left',
                            isDefault: false,
                            styles: {
                                'float': 'left',
                                'margin-right': '1em'
                            }
                        },
                        alignRight: {
                            name: 'Align right',
                            isDefault: false,
                            styles: {
                                'float': 'right',
                                'margin-left': '1em'
                            }
                        },
                        alignCenter: {
                            name: 'Align center',
                            isDefault: true,
                            styles: {
                                'margin': '0 auto',
                                'display': 'block'
                            }
                        }
                    }
                },
                // licenseKey: LICENSE_KEY,
                licenseKey: 'GPL',
                link: {
                    // Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
                    addTargetToExternalLinks: true,
                    defaultProtocol: 'https://',

                    // Let the users control the "download" attribute of each link.
                    decorators: {
                        toggleDownloadable: {
                            mode: 'manual',
                            label: 'Downloadable',
                            attributes: {
                                download: 'file'
                            }
                        }
                    }
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true
                    }
                },
                placeholder: 'Gib hier deine Nachricht ein oder füge sie über die Zwischenablage ein!',
                style: {
                    definitions: [
                        {
                            name: 'Article category',
                            element: 'h3',
                            classes: ['category']
                        },
                        {
                            name: 'Title',
                            element: 'h2',
                            classes: ['document-title']
                        },
                        {
                            name: 'Subtitle',
                            element: 'h3',
                            classes: ['document-subtitle']
                        },
                        {
                            name: 'Info box',
                            element: 'p',
                            classes: ['info-box']
                        },
                        {
                            name: 'Side quote',
                            element: 'blockquote',
                            classes: ['side-quote']
                        },
                        {
                            name: 'Marker',
                            element: 'span',
                            classes: ['marker']
                        },
                        {
                            name: 'Spoiler',
                            element: 'span',
                            classes: ['spoiler']
                        },
                        {
                            name: 'Code (dark)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-dark']
                        },
                        {
                            name: 'Code (bright)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-bright']
                        }
                    ]
                },
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
                },
                language: 'de',
                simpleUpload: {
                    uploadUrl: uploadsurl.toString(), // Hier den Pfad zum Upload-Endpoint anpassen
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': 'CSRF-Token', // Optional: CSRF-Token hinzufügen, falls erforderlich
                        Authorization: 'Bearer <token>' // Optional: Autorisierungstoken
                    }
                }
            })
            .then(newEditor => {
                editor = newEditor;

                // console.log('Toolbar:', Array.from( editor.ui.componentFactory.names() ) );

                // Wir reagieren auf das Event "setze readOnly Modus" mit dem Entfernen der Toolbar.
                const toolbarElement = editor.ui.view.toolbar.element;
                editor.on('change:isReadOnly', (evt, propertyName, isReadOnly) => {
                    if (isReadOnly) {
                        toolbarElement.style.display = 'none';
                    } else {
                        toolbarElement.style.display = 'flex';
                    }
                });

                // Beim Ändern der Fenstergröße ggfs. die Größe des Editors anpassen.
                window.addEventListener('resize', editorAdjustSize);

                resolve();
            })
            .catch(err => {
                console.error(err.message);
                reject(err);
            });
    });
}

/***************************************************************************************************************************************************/

export function editorDestroy() {
    return new Promise((resolve, reject) => {
        if (editor) {
        editor
            .destroy()
            .then(() => {
                editor = null;
                resolve();
            })
            .catch(err => {
                console.error("Fehler beim Schließen des Editors aufgetreten: " + err.message);
                reject(err);
            });
        } else {
            resolve();
        }
    });
}

/***************************************************************************************************************************************************/
// editorAdjustSize passt Höhe und Breite des Editorfensters an die es umgebende Dialogbox an.

export function editorAdjustSize() {
    // Die Dialogbox passen wir so an, dass sie den verfügbaren Platz innerhalb des editorDialog-Fensters optimal nutzt
    const editorDialog = document.getElementById('editorDialog');
    const dialogBox = document.getElementById('editorDialogbox');

    // Sicherstellen, dass die Elemente existieren
    if (!editorDialog || !dialogBox) return;

    // Wir realisieren einen css-Term der Form calc(100vh - offset)
    let maxHeight = window.innerHeight - (getMenubarUnterkante() + 60);
    editorDialog.style.maxHeight = maxHeight + "px";

    // Höhe von editorDialog ermitteln
    const dialogHeight = editorDialog.clientHeight;

    // Padding von editorDialog berechnen
    const computedStyle = window.getComputedStyle(editorDialog);
    const editorDialogPaddingTop = parseFloat(computedStyle.paddingTop);
    const editorDialogPaddingBottom = parseFloat(computedStyle.paddingBottom);

    // Padding von editorDialogbox ermitteln
    const computedDialogBoxStyle = window.getComputedStyle(dialogBox);
    const dialogBoxPaddingTop = parseFloat(computedDialogBoxStyle.paddingTop);
    const dialogBoxPaddingBottom = parseFloat(computedDialogBoxStyle.paddingBottom);

    // Margin von editorDialogbox ermitteln
    const dialogBoxMarginTop = parseFloat(computedDialogBoxStyle.marginTop);
    const dialogBoxMarginBottom = parseFloat(computedDialogBoxStyle.marginBottom);

    // Verfügbare Höhe für editorDialogbox berechnen
    let availableHeight = dialogHeight - editorDialogPaddingTop - editorDialogPaddingBottom - dialogBoxPaddingTop - dialogBoxPaddingBottom - dialogBoxMarginTop - dialogBoxMarginBottom;

    // Höhe von editorDialogbox setzen
    dialogBox.style.height = `${availableHeight}px`;

    // Höhe der übrigen Zeilen berechnen (eine enthält den Editor, alle anderen Steuerelemente o.ä.)
    // U. U. ist ein row-gap in den Styles von dialogBox festgelegt, den wir noch berücksichtigen müssen
    const computedDialogStyle = window.getComputedStyle(dialogBox);
    const rowGap = parseFloat(computedDialogStyle.rowGap);

    // Die übrigen Zeilen haben die Klasse 'editorzeile'
    let totalLineHeight = 0;
    const editorZeilen = document.querySelectorAll('.editorzeile');
    for (let i = 0; i < editorZeilen.length; i++) {
        // Die Höhe des Elements berechnen und auf die Gesamthöhe addieren
        totalLineHeight += editorZeilen[i].getBoundingClientRect().height + rowGap;
    }

    // Jetzt müssen wir noch die Höhe der Toolbar des Editors abziehen.
    const toolbar = document.querySelector('.ck-toolbar');
    if (toolbar) {
        totalLineHeight += toolbar.getBoundingClientRect().height;
    }
    // Verfügbare Höhe berechnen
    availableHeight -= totalLineHeight;

    // Editor-Höhe setzen
    editor.editing.view.change( writer => {
        writer.setStyle( 'height', `${availableHeight}px`, editor.editing.view.document.getRoot() );
    } );

    // Wir verpassen dem Editor noch ein seitliches Padding von jeweils 8px
    editor.editing.view.change( writer => {
        writer.setStyle( 'inline-padding', '10px', editor.editing.view.document.getRoot() );
    } );
    
    // Jetzt passen wir noch die Breits an. Da haben wir weniger zu tun, da es nur eine Spalte gibt, die des Editors.
    // Links und rechts haben wir nur padding zu beachten.
    const editorDialogWidth = editorDialog.clientWidth;
    const editorDialogPaddingLeft = parseFloat(computedStyle.paddingLeft);
    const editorDialogPaddingRight = parseFloat(computedStyle.paddingRight);

    // Margin und Padding von editorDialogbox ermitteln
    const dialogBoxPaddingLeft = parseFloat(computedDialogBoxStyle.paddingLeft);
    const dialogBoxPaddingRight = parseFloat(computedDialogBoxStyle.paddingRight);
    const dialogBoxMarginLeft = parseFloat(computedDialogBoxStyle.marginLeft);
    const dialogBoxMarginRight = parseFloat(computedDialogBoxStyle.marginRight);

    // Verfügbare Breite für den Editor berechnen
    let availableWidth = editorDialogWidth - editorDialogPaddingLeft - editorDialogPaddingRight - dialogBoxPaddingLeft - dialogBoxPaddingRight - dialogBoxMarginLeft - dialogBoxMarginRight - 20;

    // Breite des Editors setzen
    editor.editing.view.change( writer => {
        writer.setStyle( 'width', `${availableWidth}px`, editor.editing.view.document.getRoot() );
    } );
}

/***************************************************************************************************************************************************/

function onClickUpload()
{
    document.getElementById("file").click();
}

/***************************************************************************************************************************************************/
const Max_Datei_Groesse = 200;              // Maximale Größe einer Datei in kB

async function onDateienUpload()
{
    var files = document.getElementById("file").files;

    if (files.length > 0 ) {

        // Wir überprüfen die einzelnen Dateien auf ihre Größe.
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > Max_Datei_Groesse * 1024){
                alert(`Die Datei ${files[i].name} ist mit ${(files[i].size / 1024).toFixed(2)} kB zu groß! Erlaubt sind maximal ${Max_Datei_Groesse} kB.`);

                // Selektion des input-Buttons löschen
                document.getElementById("file").value = "";
                return;
            }
        }
    }
}

/***************************************************************************************************************************************************/
// editorCheckStatus prüft, ob der Editor aktiv ist und den angegebenen Status hat. Andernfalls wird false zurückgegeben.

export function editorCheckStatus(status) {
    if (editor) {
        return editor.state == status;
    }
    return false;
}

/***************************************************************************************************************************************************/
// editorGetData gibt den aktuellen Inhalt des Editors zurück.

export function editorGetData() {
    if (editor) {
        return editor.getData();
    }
    return '';
}

/***************************************************************************************************************************************************/
// editorSetData setzt den Inhalt des Editors auf den übergebenen Wert.

export function editorSetData(data) {
    if (editor) {
        editor.setData(data);
    }
}

/***************************************************************************************************************************************************/
// editorSetReadOnly setzt den Editor in den ReadOnly-Modus oder nimmt ihn daraus heraus.

export function editorSetReadOnly(isReadOnly) {
    if (editor) {
        if (isReadOnly) {
            editor.enableReadOnlyMode('pagn-editor');
        } else {
            editor.disableReadOnlyMode('pagn-editor');
        }
    }
}

/***************************************************************************************************************************************************/
// editorInsertText fügt den übergebenen Text im HTML-Format an der aktuellen Cursorposition ein.

export function editorInsertHTML(htmltext) {
    if (editor) {
        // Über eine temporäre textarea wandeln wir html-Tags in Codierungen um.
        // Eingabe: escapeEl.innerHTML, Ausgabe: escapeEl.textContent
        let escapeEl = document.createElement('textarea');
        escapeEl.innerHTML = htmltext;

        editor.model.change(writer => {
            writer.insertText(escapeEl.textContent, editor.model.document.selection.getLastPosition());

            escapeEl.innerHTML = editor.getData();
            editor.setData(escapeEl.textContent);

            // Focus auf den Editor setzen
            editor.editing.view.focus();
            // Leider sitzt der Cursor am Anfang des Textes. Wir setzen ihn ans Ende
        });
    }
}

/***************************************************************************************************************************************************/

export function editorInsertText(text) {
    if (editor) {
        editor.model.change(writer => {
            writer.insertText(text, editor.model.document.selection.getLastPosition());
            editor.editing.view.focus();
        });
    }
}

/***************************************************************************************************************************************************/
// editorSetVisible blendet den Editor ein oder aus. Wenn er eingebledet wird, wird er auf die Breite der Menubar gesetzt und unterlab der Menubar positioniert
// hintergrundObjektId ist die Id des Objekts, das im Hintergrund sichtbar bleiben soll, allerdings leicht abgedimmt.

export function editorSetVisible(visible, hintergrundObjektId = '') {
    if (visible) {
        // Wir machen den Editor sichtbar
        // Die obere Kante des Editordialogs unterhalb der Menubar setzen.
        setzeObjektTop('editorDialog', 8);

        if (hintergrundObjektId) {
            // Wir dimmen das Hintergrundobjekt ab
            document.getElementById(hintergrundObjektId).style.opacity = "50%";
            document.getElementById(hintergrundObjektId).style.pointerEvents = "none";
        }

        // Die Breite des editorDialog auf die Breite der Menubar setzen.
        const editorDialog = document.getElementById('editorDialog');
        editorDialog.style.width = getMenubarBreite() + 'px';
        editorDialog.style.display = "flex";

        // Die Menbar wird inaktiv gesetzt
        setzeMenubarInaktiv();
    } else {
        // Wir machen den Editor unsichtbar
        document.getElementById('editorDialog').style.display = 'none';

        if (hintergrundObjektId) {
            // Wir machen das Hintergrundobjekt wieder sichtbar
            document.getElementById(hintergrundObjektId).style.opacity = '100%';
            document.getElementById(hintergrundObjektId).style.pointerEvents = 'auto';
        }

        // Die Menubar wird wieder aktiv gesetzt
        setzeMenubarAktiv();
    }
}

/***************************************************************************************************************************************************/
