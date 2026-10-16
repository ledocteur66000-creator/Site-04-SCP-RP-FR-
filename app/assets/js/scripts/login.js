/**
 * Script for login.ejs (Modified for Offline/Crack Mode)
 */
// Validation Regexes.
const validUsername         = /^[a-zA-Z0-9_]{1,16}$/
const basicEmail            = /^\S+@\S+\.\S+$/

// Login Elements
const loginCancelContainer  = document.getElementById('loginCancelContainer')
const loginCancelButton     = document.getElementById('loginCancelButton')
const loginEmailError       = document.getElementById('loginEmailError')
const loginUsername         = document.getElementById('loginUsername')
const loginPasswordError    = document.getElementById('loginPasswordError')
const loginPassword         = document.getElementById('loginPassword')
const checkmarkContainer    = document.getElementById('checkmarkContainer')
const loginRememberOption   = document.getElementById('loginRememberOption')
const loginButton           = document.getElementById('loginButton')
const loginForm             = document.getElementById('loginForm')

// Control variables.
let lu = false, lp = false

/**
 * Show a login error.
 */
function showError(element, value){
    element.innerHTML = value
    element.style.opacity = 1
}

/**
 * Shake a login error to add emphasis.
 */
function shakeError(element){
    if(element.style.opacity == 1){
        element.classList.remove('shake')
        void element.offsetWidth
        element.classList.add('shake')
    }
}

/**
 * Validate that an email/username field is not empty.
 */
function validateEmail(value){
    if(value){
        loginEmailError.style.opacity = 0
        lu = true
        loginDisabled(false)
    } else {
        lu = false
        showError(loginEmailError, Lang.queryJS('login.error.requiredValue'))
        loginDisabled(true)
    }
}

/**
 * Validate password (not required for offline mode).
 */
function validatePassword(value){
    // Pas de validation requise pour le mode crack
    lp = true
}

// Emphasize errors with shake when focus is lost.
loginUsername.addEventListener('focusout', (e) => {
    validateEmail(e.target.value)
    shakeError(loginEmailError)
})

// Validate input for each field.
loginUsername.addEventListener('input', (e) => {
    validateEmail(e.target.value)
})

/**
 * Enable or disable the login button.
 */
function loginDisabled(v){
    if(loginButton.disabled !== v){
        loginButton.disabled = v
    }
}

/**
 * Enable or disable loading elements.
 */
function loginLoading(v){
    if(v){
        loginButton.setAttribute('loading', v)
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'))
    } else {
        loginButton.removeAttribute('loading')
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'))
    }
}

/**
 * Enable or disable login form.
 */
function formDisabled(v){
    loginDisabled(v)
    loginCancelButton.disabled = v
    loginUsername.disabled = v
    loginPassword.disabled = v
    if(v){
        checkmarkContainer.setAttribute('disabled', v)
    } else {
        checkmarkContainer.removeAttribute('disabled')
    }
    loginRememberOption.disabled = v
}

let loginViewOnSuccess = VIEWS.landing
let loginViewOnCancel = VIEWS.settings
let loginViewCancelHandler

function loginCancelEnabled(val){
    if(val){
        $(loginCancelContainer).show()
    } else {
        $(loginCancelContainer).hide()
    }
}

loginCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
        loginUsername.value = ''
        loginPassword.value = ''
        loginCancelEnabled(false)
        if(loginViewCancelHandler != null){
            loginViewCancelHandler()
            loginViewCancelHandler = null
        }
    })
}

// Disable default form behavior.
loginForm.onsubmit = () => { return false }

// Bind login button behavior for Offline Mode.
loginButton.addEventListener('click', () => {
    const username = loginUsername.value.trim();

    // Vérifie que la case pseudo n'est pas vide
    if(username === '') {
        showError(loginEmailError, "Veuillez entrer un pseudonyme !")
        shakeError(loginEmailError)
        return;
    }

    formDisabled(true)
    loginLoading(true)

    // Appel de la fonction hors-ligne d'AuthManager
    AuthManager.addOfflineAccount(username).then((value) => {
        updateSelectedAccount(value)
        
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'))
        $('.circle-loader').toggleClass('load-complete')
        $('.checkmark').toggle()
        
        setTimeout(() => {
            switchView(VIEWS.login, loginViewOnSuccess, 500, 500, async () => {
                if(loginViewOnSuccess === VIEWS.settings){
                    await prepareSettings()
                }
                loginViewOnSuccess = VIEWS.landing
                loginCancelEnabled(false)
                loginViewCancelHandler = null
                loginUsername.value = ''
                loginPassword.value = ''
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                loginLoading(false)
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'))
                formDisabled(false)
            })
        }, 1000)
    }).catch((displayableError) => {
        loginLoading(false)
        formDisabled(false)
        
        setOverlayContent(
            displayableError.title || "Erreur de connexion", 
            displayableError.desc || "Impossible de generer la session hors-ligne.", 
            Lang.queryJS('login.tryAgain')
        )
        setOverlayHandler(() => {
            toggleOverlay(false)
        })
        toggleOverlay(true)
    })
})
