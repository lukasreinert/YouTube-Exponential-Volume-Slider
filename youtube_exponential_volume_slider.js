// ==UserScript==
// @name         YouTube Exponential Volume Slider
// @namespace    https://www.tampermonkey.net/
// @version      1.1.0
// @description  Makes the YouTube video volume slider exponential so it's easier to select lower volumes.
// @author       Lukas Reinert
// @icon         https://www.youtube.com/img/favicon.ico
// @match        https://www.youtube.com/*
// @match        https://music.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const EXPONENT = 2.5;

    const storedOriginalVolumes = new WeakMap();
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');

    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
        get() {
            const lowVolume = get.call(this);
            const storedOriginalVolume = storedOriginalVolumes.get(this);
            if (storedOriginalVolume !== undefined) return storedOriginalVolume;
            return lowVolume ** (1 / EXPONENT);
        },
        set(originalVolume) {
            const adjustedVolume = Math.pow(originalVolume, EXPONENT);
            storedOriginalVolumes.set(this, originalVolume);
            set.call(this, adjustedVolume);

            console.log(`YouTube Volume: ${Math.round(originalVolume*100)}% (adjusted to ${(adjustedVolume * 100).toFixed(3)}%)`);
        }
    });

    // Ensure any videos already on the page get their volume adjusted
    const videos = document.getElementsByTagName('video');
    for (const video of videos) {
        if (!storedOriginalVolumes.has(video)) {
            const orig = video.volume;
            video.volume = orig; // triggers setter
        }
    }

})();
