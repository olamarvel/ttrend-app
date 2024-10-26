export default String.raw`
 
async function injectai() {
  alert("injected Ai")
   const trendsContainer = document.querySelector("[aria-label='Timeline: Trends']")
       if (!trendsContainer) {
     console.log('Trends container not found. Try again for Android device.')
     alert('Trends container not found.')
     return { e: true, data: 'not found' }
    }
   
 
   const trendingString = trendsContainer.innerText
   const elements = trendingString.split('\n')
 
    const postCountRegex = /(\d{1,3}(,\d{3})*\.?\d*K?) posts/i;

    const result  = elements.reduce((categories, element, index, array) => {
        const match = element.match(postCountRegex);
        if (match && index > 0) {
          const postCount = match[1];
          const categoryName = array[index - 1];
          categories.push({ category: categoryName, postCount });/';56  
        }
        return categories;
      }, [])
      .sort((a, b) => { 
        // Custom sort function based on post count
        const countA = parseFloat(a.postCount.replace(/,/g, '').replace(/K/, '000'));
        const countB = parseFloat(b.postCount.replace(/,/g, '').replace(/K/, '000'));
        return countB - countA; // Sort in descending order
      })
      .map(item => item.category).splice(0, 3).join(",");

    alert("result's result"+ result+"number of elemt"+elements.length);

   window.ReactNativeWebView.postMessage(
    'ai%'+result )
  };
`;
