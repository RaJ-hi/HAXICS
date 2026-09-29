// ==========================================
// HAXIC LOCAL STORAGE
// ==========================================

import { HAXIC_CONFIG } from "../core/config.js";


function makeKey(key) {

    return HAXIC_CONFIG.storagePrefix + key;

}


// ==========================================
// SAVE
// ==========================================

export function saveData(key, data) {

    try {

        localStorage.setItem(
            makeKey(key),
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "Haxic storage save error:",
            error
        );

        return false;

    }

}


// ==========================================
// LOAD
// ==========================================

export function loadData(
    key,
    defaultValue = null
) {

    try {

        const data = localStorage.getItem(
            makeKey(key)
        );


        if (data === null) {

            return defaultValue;

        }


        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Haxic storage load error:",
            error
        );

        return defaultValue;

    }

}


// ==========================================
// DELETE
// ==========================================

export function deleteData(key) {

    try {

        localStorage.removeItem(
            makeKey(key)
        );

        return true;

    } catch (error) {

        console.error(
            "Haxic storage delete error:",
            error
        );

        return false;

    }

}


// ==========================================
// CLEAR HAXIC DATA
// ==========================================

export function clearHaxicStorage() {

    try {

        const prefix =
            HAXIC_CONFIG.storagePrefix;


        const keys = Object.keys(
            localStorage
        );


        for (const key of keys) {

            if (key.startsWith(prefix)) {

                localStorage.removeItem(key);

            }

        }


        return true;

    } catch (error) {

        console.error(
            "Haxic storage clear error:",
            error
        );

        return false;

    }

}