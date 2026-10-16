const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs');
const path = require('path');

// 1. CONFIGURATION DU PAYSAGE
// Remplace par le pseudo que le joueur aura choisi dans ton futur menu
const pseudoDuJoueur = "JoueurTest"; 

// Crée une session 100% hors-ligne (pas besoin de compte Microsoft)
const userSession = Authenticator.getAuth(pseudoDuJoueur);

// Le dossier où le jeu va s'installer sur le PC du joueur
const appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME);
const gameDirectory = path.join(appdata, ".mon-serveur-forge");

// 2. CONFIGURATION DES OPTIONS DE JEU
let opts = {
    authorization: userSession, 
    root: gameDirectory,
    version: {
        number: "1.20.1", // <--- Mets la version exacte de ton Minecraft
        type: "release"
    },
    // Configuration de Forge
    forge: {
        version: "47.2.0" // <--- Mets la version exacte de ton installeur Forge
    },
    memory: {
        max: "4G", // RAM maximum allouée au jeu
        min: "2G"
    }
};

// 3. LANCEMENT DU JEU
console.log("Préparation et lancement du jeu...");
launcher.launch(opts);

// Permet de voir ce qu'il se passe dans la console pendant le chargement
launcher.on('debug', (e) => console.log("[DEBUG] " + e));
launcher.on('data', (e) => console.log("[JEU] " + e));
launcher.on('close', (code) => console.log("Jeu fermé avec le code : " + code));
