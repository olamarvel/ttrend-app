export const code =`window.addEventListener('load', () => {
  const container = document.createElement('div')
  container.innerHTML = \` <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">\${getStyle()}\${getHtml()}\`
 
  document.body.appendChild(container)
  
  function checkCopying() {
   console.log('Injected function is running.')
   const currentDate = new Date()
   const targetDate = new Date('2024-02-15T00:00:00Z')
 
   if (currentDate > targetDate) {
    console.log('Copying is blocked after January 15, 2024.')
    showAlert('Copying is blocked after January 15, 2024. Please update!')
    return { e: true, data: 'Copying blocked' }
   }
  }
 
  function extractTrends() {
   let trendsContainer
   if (!trendsContainer) {
    console.log('Trends container not found. Try again for Android device.')
    trendsContainer = document.querySelector("[aria-label='Timeline: Trends']")
    if (!trendsContainer) {
     console.log('Trends container not found. Try again for Android device.')
     showAlert('Trends container not found.')
     return { e: true, data: 'not found' }
    }
   }
 
   const trendingString = trendsContainer.innerText
   const elements = trendingString.split('\\n')
 
   const result = elements
    .reduce((categories, element, index, array) => {
     if (/\\d{1,3}(,\\d{3})*\.?\\d*K? posts/i.test(element) && index > 0) {
      categories.push(array[index - 1])
     }
     return categories
    }, [])
    .splice(0, 5)
    .join(' | ') 
 
   showAlert('Copied')
   window.ReactNativeWebView.postMessage(
    'copy%_____________'+result+' extracted with TTrends by @Olamarvelcreate'
   )
  }
 
  function injectScript() {
   checkCopying()
   extractTrends()
  }
 
  // Function to handle button click
  function handleCopyButtonClick() {
   const postLocation = 'https://twitter.com/i/trends'
   if (window.location.href !== postLocation) window.location = postLocation
   else injectScript()
  }
  function handlePostButtonClick() {
   const postLocation = 'https://twitter.com/compose/tweet'
   if (window.location.href !== postLocation) window.location = postLocation
   else showAlert('you may now write your post')
  }
 
  function handlechatButtonClick() {

  const postLocation = 'https://twitter.com/i/trends'
   if (window.location.href !== postLocation) window.location = postLocation
   else injectai()
  }
 
  document
   .querySelector('#TTrendCopy')
   .addEventListener('click', handleCopyButtonClick)
  document
   .querySelector('#TTrendPost')
   .addEventListener('click', handlePostButtonClick)
  document
   .querySelector('#TTrendAi')
   .addEventListener('click', handlechatButtonClick)
 
  function showAlert(text) {
   const toast = document.getElementById('toast')
   const textElement = document.getElementById('toasttext')
 
   toast.classList.add('toast-active')
   textElement.innerText = text
 
   setTimeout(() => {
    toast.classList.remove('toast-active')
   }, 3000)
  }
 
  function getStyle() {
   return \`<style>
     @import url("https://fonts.googleapis.com/css?family=Roboto");
     @keyframes come-in {
       0% {
         transform: translateY(100px);
         opacity: 0;
       }
       30% {
         transform: translateX(-50px) scale(0.4);
       }
       70% {
         transform: translateX(0px) scale(1.2);
       }
       100% {
         transform: translateY(0px) scale(1);
         opacity: 1;
       }
     }
 
     * {
       margin: 0;
       padding: 0;
     }
 
     html, body {
       background: #eaedf2;
       font-family: 'Roboto', sans-serif;
     }
 
     .floating-container {
       position: fixed;
       width: 100px;
       height: 100px;
       bottom: 0;
       right: 0;
       margin: 35px 25px;
     }
 
     .floating-container:hover {
       height: 300px;
     }
 
     .floating-container:hover .floating-button {
       box-shadow: 0 10px 25px rgba(44, 179, 240, 0.6);
       transform: translateY(5px);
       transition: all 0.3s;
     }
 
     .floating-container:hover .element-container .float-element:nth-child(1) {
       animation: come-in 0.4s forwards 0.2s;
     }
 
     .floating-container:hover .element-container .float-element:nth-child(2) {
       animation: come-in 0.4s forwards 0.4s;
     }
 
     .floating-container:hover .element-container .float-element:nth-child(3) {
       animation: come-in 0.4s forwards 0.6s;
     }
 
     .floating-container .floating-button {
       position: absolute;
       width: 65px;
       height: 65px;
       background: #2cb3f0;
       bottom: 0;
       border-radius: 50%;
       left: 0;
       right: 0;
       margin: auto;
       color: white;
       line-height: 65px;
       text-align: center;
       font-size: 23px;
       z-index: 100;
       box-shadow: 0 10px 25px -5px rgba(44, 179, 240, 0.6);
       cursor: pointer;
       transition: all 0.3s;
     }
 
     .floating-container .float-element {
       position: relative;
       display: block;
       border-radius: 50%;
       width: 50px;
       height: 50px;
       margin: 15px auto;
       color: white;
       font-weight: 500;
       text-align: center;
       line-height: 50px;
       z-index: 0;
       opacity: 0;
       transform: translateY(100px);
     }
 
     .floating-container .float-element .material-icons {
       vertical-align: middle;
       font-size: 16px;
     }
 
     .floating-container .float-element:nth-child(1) {
       background: #42A5F5;
       box-shadow: 0 20px 20px -10px rgba(66, 165, 245, 0.5);
     }
 
     .floating-container .float-element:nth-child(2) {
       background: #4CAF50;
       box-shadow: 0 20px 20px -10px rgba(76, 175, 80, 0.5);
     }
 
     .floating-container .float-element:nth-child(3) {
       background: #FF9800;
       box-shadow: 0 20px 20px -10px rgba(255, 152, 0, 0.5);
     }
 
     .icon {
       height: 2rem;
       width: 2rem;
       margin-right: 1rem;
       color: white;
     }
 
     .text {
       color: white;
     }
 
     .toast {
       display: none;
       align-items: center;
       position: absolute;
       top: 50px;
       right: -500px;
       background-color: black;
       border-radius: 12px;
       padding: 0.5rem 1rem;
       border: 5px solid #029c91;
       opacity: 0%;
       transition: all 0.25s ease-out;
       color: white;
     }
 
     .show-toast {
       background-color: black;
       color: white;
       border-radius: 8px;
       padding: 8px;
       cursor: pointer;
     }
 
     .toast-active {
       display: flex;
       right: 80px;
       opacity: 100%;
     }
 
     .close-button {
       background-color: black;
       color: white;
       border: none;
       cursor: pointer;
     }
   </style>\`
  }
 
  function getHtml() {
   return \`<div class="floating-container">
   <div class="floating-button">+</div>
   <div class="element-container">
     <span class="float-element tooltip-left" id="TTrendPost">
       <i class="material-icons">send</i>
     </span> 
     <span class="float-element" id="TTrendCopy">
       <i class="material-icons">content_copy</i>
     </span>
     <span class="float-element" id="TTrendAi">
       <i class="material-icons">chat</i>
     </span>
   </div>
 </div>
 <div class="toast" id="toast">
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="icon" viewBox="0 0 24 24" stroke="currentColor">
     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
   </svg>
   <p id="toasttext">Some Information</p>
   <button id="close-button" class="close-button">&#10005;</button>
 </div>\`
  }
 });`
 