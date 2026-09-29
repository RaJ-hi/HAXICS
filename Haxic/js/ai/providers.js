// ==========================================
// HAXIC PROVIDERS
// ==========================================
//
// Haxic does not answer questions itself.
// Providers are external AI engines.
//
// API connections will be added later.
// ==========================================


// ==========================================
// PROVIDER FACTORY
// ==========================================

function createProvider(
    id,
    name
) {

    return {

        id: id,

        name: name,

        enabled: false,


        // ==================================
        // ASK PROVIDER
        // ==================================

        async ask(question) {

            if (!question) {

                throw new Error(
                    "Question is empty."
                );

            }


            console.log(
                `${this.name} received:`,
                question
            );


            // Provider connection will be
            // implemented later.

            throw new Error(
                `${this.name} is not connected yet.`
            );

        }

    };

}


// ==========================================
// PROVIDERS
// ==========================================

const providers = [

    createProvider(
        "grok",
        "Grok"
    ),

    createProvider(
        "deepseek",
        "DeepSeek"
    ),

];


// ==========================================
// GET ALL PROVIDERS
// ==========================================

export function getProviderList() {

    return providers;

}


// ==========================================
// GET ENABLED PROVIDERS
// ==========================================

export function getEnabledProviders() {

    return providers.filter(
        provider =>
            provider.enabled === true
    );

}


// ==========================================
// ENABLE PROVIDER
// ==========================================

export function enableProvider(
    providerId
) {

    const provider =
        providers.find(
            provider =>
                provider.id === providerId
        );


    if (!provider) {

        return false;

    }


    provider.enabled =
        true;


    return true;

}


// ==========================================
// DISABLE PROVIDER
// ==========================================

export function disableProvider(
    providerId
) {

    const provider =
        providers.find(
            provider =>
                provider.id === providerId
        );


    if (!provider) {

        return false;

    }


    provider.enabled =
        false;


    return true;

}


// ==========================================
// GET ONE PROVIDER
// ==========================================

export function getProvider(
    providerId
) {

    return providers.find(
        provider =>
            provider.id === providerId
    ) || null;

}
