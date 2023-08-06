import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";
new SimpleLightbox(".gallery a");


// refs
const refs = {
    
    KEY: '38590666-b4e4facc0390580085af70521',
    baseUrl: 'https://pixabay.com/api/',
    failureMessage:  "Sorry, there are no images matching your search query. Please try again.",
    limitMessage: "We're sorry, but you've reached the end of search results.",
    gallery: document.querySelector(".gallery"),
    form: document.querySelector(".search-form"),
    loadMore: document.querySelector(".load-more"),
    page:1,
    totalPages:0,
    limit:10
}

//Listeners 

refs.form.addEventListener("submit", handleSubmit);
refs.loadMore.addEventListener("click",handleSubmit);
refs.gallery.addEventListener("click", showImage);

function showImage (e) {
  
  const clickedElement = e.target.closest('a');
  if (!clickedElement) return;

  gallery.open(clickedElement.getAttribute('href'));
}
   
// Sumblit Handle

 async function handleSubmit(e) {

    e.preventDefault();

    if(e.target.nodeName !== 'BUTTON') {
      refs.page = 1;
      refs.gallery.textContent = "";
    }
   try {

   const result = await fetchPhotos(refs.form.searchQuery.value);
   
    refs.totalPages = (result.totalHits/refs.limit);   // Check for the last page
     
    if(Math.ceil(refs.totalPages) < refs.page && result.hits.length > 0) {
      refs.loadMore.classList.add("hidden");  
      return Notiflix.Notify.failure(refs.limitMessage);
     }
    if(result.hits.length===0) {
      return Notiflix.Notify.warning(refs.failureMessage);
 
     } 
   
    if(refs.page ===1) {

      Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
    }
         
      renderMarkup(result.hits);
      refs.page+=1;
      refs.loadMore.classList.remove("hidden");


  }  catch (error) {

    Notiflix.Notify.failure(error)
  }
   
}

// Fetch photos

async function fetchPhotos (searchQuery) {
     
  const response =  await fetch(`${refs.baseUrl}?key=${refs.KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${refs.page}&per_page=${refs.limit}`);
  return response.json();
  
}

// Render markup

function renderMarkup(images) {

        const markup = images.reduce((html,{webformatURL,largeImageURL,tags,likes,views,comments,downloads} ) => {
         return html+` 
         <div class="photo-card">
         <a href="${largeImageURL}">
         <img src="${webformatURL}" alt="${tags}" width="300px" loading="lazy" />
         </a>
         <div class="info">
           <p class="info-item">
             <b>Likes ${likes}</b>
           </p>
           <p class="info-item">
             <b>Views ${views}</b>
           </p>
           <p class="info-item">
             <b>Comments ${comments}</b>
           </p>
           <p class="info-item">
             <b>Downloads ${downloads}</b>
           </p>
         </div>
       </div>
       `
     },"")   

     refs.gallery.insertAdjacentHTML("beforeend",markup);
}


