<?php
/**
 * This file is part of SV-Tool-Editor.
 * Copyright (C) 2025 Andreas Lindenberg <Lindenberg@abendgymnasien.de>
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

use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

/***************************************************************************************************************************************************/
// prepareImagesFromCKEditForMail bereitet die Bilder im HTML-Text für den Versand per E-Mail vor.
// Es muss die Ausrichtung der Bilder und die Skalierung berücksichtigt werden. Diese Parameter werden in ckeditor als Klassen kodiert und müssen
// in die Inline-Styles der Bilder überführt werden.

function prepareImagesFromCKEditForMail(&$mailtextHTML)
{
    // Wir kümmern uns jetzt um die Formatierung der Bilder, sofern sie in figure kodiert sind.
    $mailtextHTML = preg_replace_callback(
        '/<figure([^>]*)>\s*<img([^>]*)>\s*<\/figure>/i',
        function ($matches) {
            $figureAttributes = $matches[1]; // Attribute von <figure>
            $imgAttributes = $matches[2]; // Attribute von <img>
    
            // Extrahiere style-Attribut aus <figure>
            preg_match('/style="([^"]*)"/i', $figureAttributes, $styleMatch);
            $figureStyle = $styleMatch[1] ?? '';
    
            // Verarbeite das style-Attribut im <img>-Tag
            if (strpos($imgAttributes, 'style=') !== false) {
                // Ergänze vorhandene Stile im <img>-Tag
                $imgAttributes = preg_replace(
                    '/style="([^"]*)"/i',
                    'style="' . $figureStyle . ' $1"',
                    $imgAttributes
                );
            } elseif ($figureStyle) {
                // Füge neues style-Attribut hinzu
                $imgAttributes .= ' style="' . $figureStyle . '"';
            }
    
            // Extrahiere class-Attribut aus <figure>
            preg_match('/class="([^"]*)"/i', $figureAttributes, $classMatch);
            $figureClasses = $classMatch[1] ?? '';
    
            // Verarbeite das class-Attribut im <img>-Tag
            if (strpos($imgAttributes, 'class=') !== false) {
                // Extrahiere vorhandene Klassen im <img>-Tag
                preg_match('/class="([^"]*)"/i', $imgAttributes, $imgClassMatch);
                $imgClasses = $imgClassMatch[1] ?? '';
    
                // Füge nur neue Klassen hinzu, die noch nicht vorhanden sind
                $newClasses = array_diff(explode(' ', $figureClasses), explode(' ', $imgClasses));
                if (!empty($newClasses)) {
                    $imgAttributes = preg_replace(
                        '/class="([^"]*)"/i',
                        'class="$1 ' . implode(' ', $newClasses) . '"',
                        $imgAttributes
                    );
                }
            } elseif ($figureClasses) {
                // Füge neues class-Attribut hinzu, wenn es im <img>-Tag fehlt
                $imgAttributes .= ' class="' . $figureClasses . '"';
            }
    
            // Gib das aktualisierte <img>-Tag zurück
            return '<img' . $imgAttributes . '>';
        },
        $mailtextHTML
    );
                                                    
    // Wir kümmern uns jetzt noch um die Ausrichtung der Bilder, welche in den Klassen kodiert ist.
    $mailtextHTML = preg_replace_callback(
        '/<img([^>]*)>/i',
        function ($matches) {
            $image = $matches[0];
            $imgAttributes = $matches[1];

            // Sicherstellen, dass die Propotionen des Bildes erhalten bleiben
            if (strpos($image, 'style=') !== false) {
                $image = preg_replace(
                    '/style="([^"]*)"/i',
                    'style="max-width: 100%; height: auto; $1"',
                    $image
                );
            } else {
                // Wir fügen in das img-Tag ein style-Attribut ein, wenn es noch nicht vorhanden ist.
                $image = preg_replace(
                    '/<img([^>]*)>/i',
                    '<img style="max-width: 100%; height: auto;" $1>',
                    $image
                );
            }
            
            // Wir entfernen aspect-ratio aus dem style-Attribut, da es in E-Mails nicht unterstützt wird.
            $image = preg_replace(
                '/style="([^"]*)aspect-ratio:[^;]*;([^"]*)"/i',
                'style="$1$2"',
                $image
            );

            // Extrahiere class-Attribut aus <img>
            preg_match('/class="([^"]*)"/i', $imgAttributes, $classMatch);
            $classAttribute = $classMatch[1] ?? '';

            // Berechne den alignmentStyle basierend auf den Klassen
            if (strpos($classAttribute, 'image-style-side') !== false) {
                // rechtsbündige Bilder
                return '<p style="text-align: right;">' . $image . '</p>';
            } elseif (strpos($classAttribute, 'image image_resized') !== false) {
                // Zentrierte Bilder
                return '<p style="text-align: center;">' . $image . '</p>';
            } elseif (strpos($classAttribute, 'image_resized') !== false) {
                // linksbündige Bilder
                return '<p style="text-align: left;">' . $image . '</p>';
            } else {
                // Bilder ohne Ausrichtung zentrieren wir.
                return '<p style="text-align: center;">' . $image . '</p>';
            }
        },
        $mailtextHTML
    );
}

/***************************************************************************************************************************************************/
// addInlineImages fügt alle Bilder, die im HTML-Text enthalten sind, als Inline-Anhänge zur E-Mail hinzu.
// Die Bilder werden als CID (Content-ID) eingebettet, sodass sie im E-Mail-Client korrekt angezeigt werden.
function addInlineImages(&$mail, &$mailtextHTML) {
    // Inline-Bilder hinzufügen (CID)
    if (preg_match_all('/<img[^>]*src=["\']([^"\']+)["\']/i', $mailtextHTML, $matches)) {
        foreach ($matches[1] as $index => $imageUrl) {
            // Lokalen Bildpfad aus der URL ableiten
            if ($_SERVER['SERVER_NAME'] === 'localhost') {
                // Variante auf Testserver
                $imagePath = str_replace('http://localhost/pagn-sv/', '../', $imageUrl);
            } else {
                // Variante auf Live-Server
                $imagePath = str_replace('https://www.abendgymnasien.de/pagn-sv/', '../', $imageUrl);
            }


            // Bild als Inline-Anhang hinzufügen
            if (file_exists($imagePath)) {
                $cid = 'image' . ($index + 1); // Dynamische CID

                // Bild-URL im HTML durch CID ersetzen
                $anzahlersetzungen = 0;
                $mailtextHTML = str_replace($imageUrl, 'cid:' . $cid, $mailtextHTML, $anzahlersetzungen);
                
                // Falls mehrfach das gleiche Bild verwendet wurde, müssen wir es nur einmal anhängen.
                if ($anzahlersetzungen > 0) {
                    $mail->addEmbeddedImage($imagePath, $cid);
                }
            }
        }
    }
}

/***************************************************************************************************************************************************/
function ladeDatei($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    $data = curl_exec($ch);

    if (curl_errno($ch)) {
        error_log('cURL-Fehler: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode === 200) ? $data : false;
}

/***************************************************************************************************************************************************/
function urlKorrigieren($url) {
    $teile = parse_url($url);
    $pfad = array_map('rawurlencode', explode('/', $teile['path']));
    $kodierterPfad = implode('/', $pfad);

    $neueUrl = $teile['scheme'] . '://' . $teile['host'] . $kodierterPfad;
    if (isset($teile['query'])) {
        $neueUrl .= '?' . $teile['query'];
    }
    return $neueUrl;
}

/***************************************************************************************************************************************************/
// urls: Pfade von Dateien als Anhang zur E-Mail

function smtpmailHTML($empfaengermail, $empfaengername, $absendermail, $absendername, $betreff, $mailtextHTML, $standort, $urls = [])
{
    if ($empfaengermail === '') {
        phpmail('lindenberg@abendgymnasien.de', "Fehler in smtpmailHTML", "Keine E-Mail-Adresse für Empfänger hinterlegt.\n". $mailtextHTML, $standort);
        return;
    }

    $impressum = ($standort === 'N') ? '<p>'. Impressum_N. '</p>': '<p>'. Impressum_W. '</p>';

    $mail = null;
    try {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->SMTPDebug = 0;
        $mail->Debugoutput = 'html';
        $mail->CharSet = 'utf-8';
        $mail->Encoding = 'base64';
        $mail->isHtml(true);
        $mail->Host = 'smtp.strato.com';
        $mail->Port = 587;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->SMTPAuth = true;
        $mail->Username = ($standort === 'N') ? Mail_SVTool_N : Mail_SVTool_W;
        $mail->Password = $_SESSION['svtool_mail_kennwort'];
        $mail->setFrom($absendermail, $absendername);
        if ($_SERVER['SERVER_NAME'] === 'localhost')
            // Auf dem Testserver gehen Mails nur an mich.
            $empfaengermail = 'lindenberg@abendgymnasien.de';
        $mail->addAddress($empfaengermail, $empfaengername);

        prepareImagesFromCKEditForMail($mailtextHTML);
        addInlineImages($mail, $mailtextHTML);

        $mail->Subject = $betreff;
        $mail->Body = "<html><body>$mailtextHTML<hr>$impressum</body></html>";

        // evtl. Dateien anhängen
        if (is_array($urls)) {
            // addAttachment benötigt lokale Pfade
            foreach ($urls as $url) {
                if (strpos($url, 'http://localhost') === 0) {
                    // Lokale Datei im Entwicklungsserver
                    $lokalerPfad = str_replace('http://localhost', $_SERVER['DOCUMENT_ROOT'], $url);
                    if (file_exists($lokalerPfad)) {
                        $mail->addAttachment($lokalerPfad);
                    } else {
                        error_log("Datei nicht gefunden: $lokalerPfad");
                    }
                } else {
                    // Remote-URL (z. B. https://...)
                    $url = urlKorrigieren($url);
                    $inhalt = ladeDatei($url);
                    $tempPath = tempnam(sys_get_temp_dir(), 'anhang_');
                    if ($inhalt !== false) {
                        file_put_contents($tempPath, $inhalt);
                        $mail->addAttachment($tempPath, basename(parse_url($url, PHP_URL_PATH)));
                    } else {
                        error_log("Fehler beim Herunterladen der Datei: $url");
                    }
                }
            }
        }

        // E-Mail senden            
        if (!$mail->send()) {
            phpmail('lindenberg@abendgymnasien.de', 'Fehler in smtpmailHTML', $mail->ErrorInfo.'\n'. $mailtextHTML, $standort);
        }
    } catch (Exception $e) {
        phpmail('lindenberg@abendgymnasien.de', 'Fehler in smtpmailHTML', $mail->ErrorInfo .'\n'. $mailtextHTML, $standort);
    }
}

/***************************************************************************************************************************************************/