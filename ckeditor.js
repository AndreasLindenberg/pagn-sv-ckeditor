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
// Letzte Überprüfung mit KI: 4.3.2026
// KI: Claude Opus 4.5
/***************************************************************************************************************************************************/

/***************************************************************************************************************************************************/
'use strict';

// Bekannter, harmloser Browser-Fehler: CKEditors interner ResizeObserver kann nicht alle
// Notifications in einem einzigen Animation-Frame ausliefern. Diesen Fehler unterdrücken.
window.addEventListener('error', (ev) => {
    if (ev.message === 'ResizeObserver loop completed with undelivered notifications.') {
        ev.stopImmediatePropagation();
    }
});

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
/**
 * Erstellt einen CKEditor und bindet ihn an das Textarea-Element mit der Id "editor". Dabei werden die Toolbar, die Plugins und die Sprache des Editors konfiguriert.
 * Der Editor wird in einem Dialogfenster angezeigt, das sich an der Menubar orientiert. Das Dialogfenster passt seine Größe automatisch an die Fenstergröße an.
 * zielgruppe: L oder S: Werden die Mails für Lehrkräfte oder für Studierende bearbeitet?
 * betrachtertyp: S, L, oder A: Person aus welcher Gruppe sitzt gerade vor dem Computer?
 * betrachterid: Welche Person konkret?
 * @returns {Promise} Ein Promise, das den erstellten CKEditor zurückgibt.
 */
export function editorCreate() {
    return new Promise((resolve, reject) => {
        const uploadsurl = new URL("json/json_ckeditoruploads.php", document.baseURI);

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
/**
 * Zerstört den CKEditor, indem die destroy()-Methode des Editors aufgerufen wird. Dabei wird der Editor-Variable der Wert null zugewiesen.
 * @returns {Promise} Ein Promise, das aufgelöst wird, wenn der Editor erfolgreich zerstört wurde, oder abgelehnt wird, wenn ein Fehler auftritt.
 */
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
/**
 * Passt die Größe des CKEditor-Fensters an die umgebende Dialogbox an.
 * @returns {void}
 */
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
    const rowGap = parseFloat(computedDialogBoxStyle.rowGap);

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

    // Die Borders des CKEditor-Containers (.ck-editor, .ck-editor__editable) berücksichtigen.
    const ckEditor = document.querySelector('.ck.ck-editor');
    if (ckEditor) {
        const ckStyle = window.getComputedStyle(ckEditor);
        totalLineHeight += parseFloat(ckStyle.borderTopWidth) + parseFloat(ckStyle.borderBottomWidth);
    }
    const ckEditable = document.querySelector('.ck-editor__editable');
    if (ckEditable) {
        const ckEditableStyle = window.getComputedStyle(ckEditable);
        totalLineHeight += parseFloat(ckEditableStyle.borderTopWidth) + parseFloat(ckEditableStyle.borderBottomWidth);
    }

    // Verfügbare Höhe berechnen
    availableHeight -= totalLineHeight;

    // Editor-Höhe und seitliches Padding setzen
    editor.editing.view.change( writer => {
        const root = editor.editing.view.document.getRoot();
        writer.setStyle( 'height', `${availableHeight}px`, root );
        writer.setStyle( 'inline-padding', '10px', root );
    } );
    
    // Jetzt passen wir noch die Breite an. Da haben wir weniger zu tun, da es nur eine Spalte gibt, die des Editors.
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
/**
 * Prüft, ob der Editor aktiv ist und den angegebenen Status hat. Andernfalls wird false zurückgegeben.
 * @param {string} status 
 * @returns {boolean} true, wenn der Editor aktiv ist und den angegebenen Status hat, andernfalls false.
 */
export function editorCheckStatus(status) {
    if (editor) {
        return editor.state === status;
    }
    return false;
}

/***************************************************************************************************************************************************/
/**
 * Gibt den aktuellen Inhalt des Editors zurück.
 * @returns {string} Der aktuelle Inhalt des Editors.
 */
export function editorGetData() {
    if (editor) {
        return editor.getData();
    }
    return '';
}

/***************************************************************************************************************************************************/
// editorSetData setzt den Inhalt des Editors auf den übergebenen Wert.
/**
 * Setzt den Inhalt des Editors auf den übergebenen Wert.
 * @param {string} data 
 */
export function editorSetData(data) {
    if (editor) {
        editor.setData(data);
    }
}

/***************************************************************************************************************************************************/
/**
 * Setzt den Editor in den ReadOnly-Modus oder nimmt ihn daraus heraus.
 * @param {boolean} isReadOnly 
 */
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
/**
 * Fügt den übergebenen HTML-Text an der aktuellen Cursorposition ein.
 * @param {string} htmltext  Der HTML-Text, der eingefügt werden soll.
 * @param {boolean} cursorInNeuenParagraph  true: Es wird ein neuer Paragraph an den Text angefügt. Der Cursor wird in den letzten (neuen) Paragraph gesetzt. false: Cursor bleibt direkt hinter dem eingefügten Text
 */ 
export function editorInsertHTML(htmltext, cursorInNeuenParagraph = true) {
    if (editor) {
        // Über eine temporäre textarea wandeln wir html-Tags in Codierungen um.
        // Eingabe: escapeEl.innerHTML, Ausgabe: escapeEl.textContent
        let escapeEl = document.createElement('textarea');
        escapeEl.innerHTML = htmltext + (cursorInNeuenParagraph ? '<p>&nbsp;</p>' : '');

        editor.model.change(writer => {
            writer.insertText(escapeEl.textContent, editor.model.document.selection.getLastPosition());

            escapeEl.innerHTML = editor.getData();
            editor.setData(escapeEl.textContent);
        });

        if (cursorInNeuenParagraph) {
            // Doppelte leere Paragraphen am Ende entfernen, aber mindestens einen behalten
            editor.model.change(writer => {
                const root = editor.model.document.getRoot();
                // Nur entfernen wenn mehr als 2 Kinder vorhanden (Anrede + 2 leere Paragraphen)
                while (root.childCount > 2) {
                    const lastChild = root.getChild(root.childCount - 1);
                    const secondLast = root.getChild(root.childCount - 2);
                    
                    // Prüfen ob beide Paragraphen sind und beide leer sind
                    if (lastChild.name === 'paragraph' && secondLast.name === 'paragraph') {
                        const lastText = lastChild.childCount > 0 ? lastChild.getChild(0).data : '';
                        const secondLastText = secondLast.childCount > 0 ? secondLast.getChild(0).data : '';
                        
                        const lastIsEmpty = lastText === '' || lastText === '\u00A0' || lastText.trim() === '';
                        const secondLastIsEmpty = secondLastText === '' || secondLastText === '\u00A0' || secondLastText.trim() === '';
                        
                        // Nur entfernen wenn beide leer sind (dann ist einer überflüssig)
                        if (lastIsEmpty && secondLastIsEmpty) {
                            writer.remove(lastChild);
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            });

            // Cursor in den letzten Paragraph setzen (an den Anfang des Paragraphs)
            editor.model.change(writer => {
                const root = editor.model.document.getRoot();
                const lastChild = root.getChild(root.childCount - 1);
                if (lastChild) {
                    // Position am Anfang des letzten Paragraphs (nach dem öffnenden Tag)
                    writer.setSelection(lastChild, 0);
                }
            });
        }

        // Focus auf den Editor setzen
        editor.editing.view.focus();
    }
}

/***************************************************************************************************************************************************/
/**
 * Setzt den übergebenen Text an der aktuellen Cursorposition ein. Der Cursor wird direkt hinter dem eingefügten Text positioniert.
 * @param {string} text 
 */
export function editorInsertText(text) {
    if (editor) {
        editor.model.change(writer => {
            const insertPosition = editor.model.document.selection.getLastPosition();
            writer.insertText(text, insertPosition);
            
            // Cursor ans Ende des eingefügten Textes setzen
            const newPosition = insertPosition.getShiftedBy(text.length);
            writer.setSelection(newPosition);
        });
        editor.editing.view.focus();
    }
}

/***************************************************************************************************************************************************/
/**
 * Blendet den Editor ein oder aus. Wenn er eingeblendet wird, wird er auf die Breite der Menubar gesetzt und unterhalb der Menubar positioniert.
 * @param {boolean} visible 
 * @param {string} hintergrundObjektId Id des Objekts, das im Hintergrund sichtbar bleiben soll, allerdings leicht abgedimmt.
 */
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
