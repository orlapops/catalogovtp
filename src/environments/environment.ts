export const environment = {
  production: true, // set TRUE before you build and release a prod version.
  // Set your app configurations here.
  // For the list of config options, please refer to https://ionicframework.com/docs/api/config/Config/
  config: {
    // iconMode: 'md',
    // mode: 'md'
    // iconMode: 'ios',
    // mode: 'ios'
    // preloadModules: true,
    // scrollPadding: false,
    // scrollAssist: true,
    autoFocusAssist: false,
    menuType: 'overlay'
  },
  firebase: {
    //Via tropical con proyecto catalogo
    apiKey: "AIzaSyCFv63sqOWZKp3CJvFOeq8WDIHJwR26XpE",
    authDomain: "viatropicalfb.firebaseapp.com",
    databaseURL: "https://viatropicalfb.firebaseio.com",
    projectId: "viatropicalfb",
    storageBucket: "viatropicalfb.appspot.com",
    messagingSenderId: "474270541113"

    //Si va a compilar para Javar estas son las credenciales
            // apiKey: "AIzaSyBrXImX2qR-tVFzjBMziucfyHQU2Lwjuno",
            // authDomain: "catalogojavar-e7ea1.firebaseapp.com",
            // databaseURL: "https://catalogojavar-e7ea1.firebaseio.com",
            // projectId: "catalogojavar-e7ea1",
            // storageBucket: "catalogojavar-e7ea1.appspot.com",
            // messagingSenderId: "492412631854"
    //Boccherini
    //  apiKey: "AIzaSyDn_a46aGh-s-enMAg-Pyr5CaS2M71VHx4",
    // authDomain: "netsolin-49ea4.firebaseapp.com",
    // databaseURL: "https://netsolin-49ea4.firebaseio.com",
    // projectId: "netsolin-49ea4",
    // storageBucket: "netsolin-49ea4.appspot.com",
    // messagingSenderId: "22671254985"        
    
        },

  // Set language to use.
  language: 'en',
  // Loading Configuration.
  // Please refer to the official Loading documentation here: https://ionicframework.com/docs/api/components/loading/LoadingController/
  loading: {
    spinner: 'circles'
  },
  // Toast Configuration.
  // Please refer to the official Toast documentation here: https://ionicframework.com/docs/api/components/toast/ToastController/
  toast: {
    position: 'bottom' // Position of Toast, top, middle, or bottom.
  },
  toastDuration: 3000, // Duration (in milliseconds) of how long toast messages should show before they are hidden.
}
