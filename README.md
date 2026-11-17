# ShareNode P2P

PWA de transfert direct entre deux mobiles : fichiers (multiples), chat, appairage par ID ou QR code.

## Deux modes de connexion
- **Par ID (Internet)** : ID persistant + QR, via PeerJS. Reconnexion rapide aux appareils récents.
- **Sans serveur (QR)** : appairage par échange de deux QR codes (WebRTC), sans serveur. Même Wi-Fi ou partage de connexion requis.

## Utilisation
1. Ouvrir l'appli sur les deux mobiles (GitHub Pages, HTTPS obligatoire pour la caméra).
2. Se connecter par ID/scan, ou via l'onglet « Sans serveur ».
3. Choisir un ou plusieurs fichiers puis « Transmettre ». Le destinataire touche « Enregistrer ».

## Limites connues
- Le fichier reçu est gardé en mémoire : évitez les fichiers de plusieurs centaines de Mo.
- Le mode QR n'utilise pas de serveur STUN : il ne fonctionne pas entre réseaux différents.
- Les librairies (qrcodejs, PeerJS, jsQR) sont chargées depuis cdnjs. Pour un usage 100 % hors-ligne, copiez-les dans le dépôt et adaptez les balises `<script>` et `sw.js`.
