<?php
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

include_once '../includes/session.inc.php';

// Haben wir eine gültige Session?
checksession(true, true, false);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['upload'])) {
    $fileName = basename($_FILES['upload']['name']);

    // Generiere einen eindeutigen Dateinamen
    $uniqueName = uniqid("", true) . '-' . preg_replace('/[^a-zA-Z0-9.\-_]/', '', $fileName);

    // Pfad zur Speicherung der Datei
    $targetFile = '../uploads/ckeditor/' . $uniqueName;

    // Nur bestimmte Formate erlauben
    $allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (in_array($_FILES['upload']['type'], $allowedTypes)) {
        // Datei verschieben
        if (move_uploaded_file($_FILES['upload']['tmp_name'], $targetFile)) {
            // Erfolg: URL zur Datei zurückgeben
            // Wir benötigen den kompletten Pfad, damit die Datei vom Editor geladen werden kann
            $dateiurl = (strpos(__FILE__, 'XAMPP') !== false) ? (String) 'http://localhost' : 'https://'. $_SERVER['HTTP_HOST'];
            $dateiurl .= (String) '/pagn-sv/uploads/ckeditor/'. $uniqueName;
            echo json_encode(['url' => $dateiurl]);
        } else {
            // Fehler beim Speichern
            http_response_code(500);
            echo json_encode(['error' => 'File upload failed.']);
        }
    } else {
        // Ungültiger Dateityp
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type.']);
    }
} else {
    // Kein Upload
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded.']);
}
