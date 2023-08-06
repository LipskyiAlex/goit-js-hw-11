import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";
import { fetchImages } from './pixaby-api';

const gallery = document.querySelector(".gallery");
const form = document.querySelector(".search-form");
// refs
const refs = { 

    failureMessage:  "Sorry, there are no images matching your search query. Please try again.",
    limitMessage: "We're sorry, but you've reached the end of search results.",
    page:1,
    totalPages:0,
    limit:10,
}

//Listeners 

form.addEventListener("submit", handleSubmit);

// Sumblit Handle

 async function handleSubmit(e) {
 
    e.preventDefault(); 
     
      gallery.textContent = "";
    
   try {
   
  
   const result = await fetchImages(form.searchQuery.value,refs.page,refs.limit);   

    refs.totalPages = (result.totalHits/refs.limit);   // Check for the last page
     
    if(Math.ceil(refs.totalPages) < refs.page && result.hits.length > 0) {
     
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
        
  }  catch (error) {

    Notiflix.Notify.failure(error)
  }
   
}

// Render markup

function renderMarkup(images) {

        const markup = images.reduce((html,{webformatURL,largeImageURL,tags,likes,views,comments,downloads} ) => {
         return html+` 
         <div class="photo-card">
         <a class="gallery__link" href="${largeImageURL}">
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

     gallery.insertAdjacentHTML("beforeend",markup);
     new SimpleLightbox(".gallery a").refresh()
}

// Infinity scroll 

window.addEventListener('scroll', async function() {
  // Check if the user has reached the bottom of the page
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    // Check if there are more pages to load
    if (refs.page < refs.totalPages) {
      refs.page++;
      const result = await fetchImages(form.searchQuery.value,refs.page,refs.limit);
      renderMarkup(result.hits);
   
    }

  }
});

//------------------------------------------------------