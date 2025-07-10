# pagn-sv-ckeditor
Veröffentlichung der Module des SV-Tools, die den ckeditor aufrufen.

# SV-Tool

**SV-Tool** ist ein webbasiertes Verwaltungstool für Lehrkräfte und Studierende am Privaten Abendgymnasium in Nürnberg.
Es verwendet den [CKEditor 5](https://ckeditor.com/ckeditor-5/), um E-Mails zu gestalten, die klassenweisean Studierende
oder an Lehrkräfte versendet werden.

## 🔧 Features

- CKEditor 5-Integration
- E-Mails aus einer Kombination von Text und Bildern gestalten.
- E-Mails versenden
- Nur für den internen Schulgebrauch vorgesehen

## 🛠️ Installation

1. Repository klonen oder Dateien herunterladen
2. `config.php` (oder `.env`) anpassen
3. Editor im geschützten Bereich aufrufen
4. Webserver mit PHP-Unterstützung vorausgesetzt

## 📂 Verzeichnisstruktur

```
/sv-tool-editor/
├── ckeditor.js              # ckeditor wird überlagert mit einem Satz eigener Funktionen zur Integration in das SV-Tool-Projekt
├── ckmailings.js            # Realisierung eines Maileditors mit Speichern und Ändern einer (neu) gestalteten E-Mail
├── ckeditormails.css        # css-Styles
├── ckmails.inc.php          # Serverseitige Aufbereitung der E-Mails für den Versand mit PHPMailer
├── json_ckeditoruploads.php # Hochladen eingebetter Bilder in temporäre Dateien auf den Server
├── LICENSE                  # GPLv3-Lizenz
├── README.md                # Diese Datei
```

## 📜 Lizenz

Dieses Projekt steht unter der **GNU General Public License v3.0** – siehe [LICENSE](./LICENSE).  
Die Software darf frei verwendet, verändert und weitergegeben werden, solange die Lizenzbedingungen eingehalten werden.

© 2025 Privates Abendgymnasium Nürnberg, Andreas Lindenberg  
