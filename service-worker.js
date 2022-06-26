/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  './index.html',
  './jsconfig.json',
  './manifest.webmanifest',
  './service-worker.js',
  './Images/back.png',
  './Images/chain.png',
  './Images/character.png',
  './Images/cursor.png',
  './Images/darkness.png',
  './Images/decoy.png',
  './Images/door.png',
  './Images/dragon.png',
  './Images/faces.png',
  './Images/flames.png',
  './Images/ghost.png',
  './Images/master-sponge.png',
  './Images/oscar.png',
  './Images/reaper.png',
  './Images/skeleton.png',
  './Images/sparkBase.png',
  './Images/sparks.png',
  './Images/sponge.png',
  './Images/thaddeus.png',
  './Images/thaddeusSycthe.png',
  './Images/troll.png',
  './Images/troll2.png',
  './Images/troll3.png',
  './Images/virgil.png',
  './Images/Backgrounds/back.png',
  './Images/Backgrounds/back2.png',
  './Images/Backgrounds/backCrystal.png',
  './Images/Backgrounds/bigDoor.png',
  './Images/Backgrounds/deadTrees.png',
  './Images/Backgrounds/ocean.png',
  './Images/Backgrounds/tunnel.png',
  './Images/Backgrounds/wideTunnel.png',
  './Images/Cutscenes/Intro/back.png',
  './Images/Cutscenes/Intro/playersitting.png',
  './Images/Cutscenes/Intro/playerstanding.png',
  './Images/Cutscenes/Intro/playerwalkingdown.png',
  './Images/Cutscenes/Intro/shield.png',
  './Images/Cutscenes/Intro/sword.png',
  './Images/Ocean/angler.png',
  './Images/Ocean/dolphin.png',
  './Images/Workflow/HeartOfTheEarth.xcf',
  './Images/Workflow/virgil.xcf',
  './PWA/icon.svg',
  './PWA/icon192x192.png',
  './PWA/icon512x512.png',
  './Scripts/afterwork.js',
  './Scripts/classes.js',
  './Scripts/monsters.js',
  './Scripts/script.js',
  './Scripts/text.js',
  './Scripts/timing.js',
  './Scripts/Areas/area-aorta.js',
  './Scripts/Areas/area-ocean.js',
  './Scripts/Areas/area-underworld.js',
  './Scripts/Areas/area.js',
  './Scripts/libraries/Controller.layouts.min.js',
  './Scripts/libraries/Controller.min.js',
  './Scripts/libraries/perlin.js',
  './Scripts/monsters/darkness.js',
  './Sounds/accordion.wav',
  './Sounds/amadeus.mp3',
  './Sounds/amadeus.wav',
  './Sounds/ambientNoise.mp3',
  './Sounds/ambientNoise.wav',
  './Sounds/aragore.mp3',
  './Sounds/aragore.wav',
  './Sounds/attack.mp3',
  './Sounds/attack.wav',
  './Sounds/back.mp3',
  './Sounds/back.wav',
  './Sounds/berried.mp3',
  './Sounds/berried.wav',
  './Sounds/blip.mp3',
  './Sounds/blip.wav',
  './Sounds/chain.wav',
  './Sounds/charge1.mp3',
  './Sounds/charge1.wav',
  './Sounds/charge2.mp3',
  './Sounds/charge2.wav',
  './Sounds/charge3.mp3',
  './Sounds/charge3.wav',
  './Sounds/darkness-fight.wav',
  './Sounds/deathfx.mp3',
  './Sounds/deathFX.wav',
  './Sounds/die.mp3',
  './Sounds/die.wav',
  './Sounds/errorBlip.wav',
  './Sounds/fight.mp3',
  './Sounds/fight.wav',
  './Sounds/gameover.mp3',
  './Sounds/gameover.wav',
  './Sounds/magic.mp3',
  './Sounds/magic.wav',
  './Sounds/master-sponge.wav',
  './Sounds/normalByte.mp3',
  './Sounds/normalByte.wav',
  './Sounds/pre-master-sponge.wav',
  './Sounds/ringtone.mp3',
  './Sounds/ringtone.wav',
  './Sounds/speechByte (old).wav',
  './Sounds/speechByte.mp3',
  './Sounds/speechByte.wav',
  './Sounds/suspense.wav',
  './Sounds/thaddeus.wav',
  './Sounds/troll-fanfare.mp3',
  './Sounds/troll-fanfare.wav',
  './Sounds/underworld-fight.mp3',
  './Sounds/underworld-fight.wav',
  './Sounds/underworld.mp3',
  './Sounds/underworld.wav',
  './Sounds/virgil-theme.wav',
  './Sounds/darkness/attack-choir.mp3',
  './Sounds/darkness/attack-choir.wav',
  './Sounds/darkness/attack-slash.mp3',
  './Sounds/darkness/attack-slash.wav',
  './Sounds/darkness/sayonara.mp3',
  './Sounds/darkness/sayonara.wav',
  './Styles/animations.css',
  './Styles/faces.css',
  './Styles/monsters.css',
  './Styles/player.css',
  './Styles/styles.css',  
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  console.warn("clearing service worker caches");
  caches.delete(PRECACHE);
  caches.delete(RUNTIME);

  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});