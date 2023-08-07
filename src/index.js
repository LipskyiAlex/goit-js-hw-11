import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";
import { fetchImages } from './pixaby-api';
import { debounce, throttle } from 'lodash';


const gallery = document.querySelector(".gallery");
const form = document.querySelector(".search-form");
// refs
const refs = { 

    failureMessage:  "Sorry, there are no images matching your search query. Please try again.",
    limitMessage: "We're sorry, but you've reached the end of search results.",
    page:1,
    totalPages:0,
    limit:10
}

 const lightbox = new SimpleLightbox(".gallery a");

//Listeners 

form.addEventListener("submit", handleSubmit);

// Sumblit Handleser4

 async function handleSubmit(e) {
 
    e.preventDefault(); 

     let query = form.searchQuery.value.trim();

     if(query === '') {

      return Notiflix.Notify.failure("The field can't be empty! Please type at least 1 character");
     }
     
      gallery.textContent = "";
    
   try {
   
   const result = await fetchImages(query,refs.page,refs.limit);   

   if(result.hits.length===0) {
    return Notiflix.Notify.warning(refs.failureMessage);
   }  

    refs.totalPages = (result.totalHits/refs.limit); 
    // Check for the last page
     
    if(Math.ceil(refs.totalPages) < refs.page && result.hits.length > 0) {
     
      return Notiflix.Notify.failure(refs.limitMessage);
     }
   
     renderMarkup(result.hits);
      simpleLightbox = new SimpleLightbox(".gallery a").refresh();
     Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
        
  }  catch (error) {

    Notiflix.Notify.failure("Something went wrong, please try again later");
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
           <div class="info-item">
             <p>Likes</p>
             <p>${likes}</p>
           </div>
           <div class="info-item">
             <p>Views</p>
             <p>${views}</p>
           </div>
           <div class="info-item">
             <p>Comments</p>
             <p>${comments}</p>
           </div>
           <div class="info-item">
             <p>Downloads</p>
             <p>${downloads}</p>
           </div>
         </div>
       </div>
       `
     },"")   

     gallery.insertAdjacentHTML("beforeend",markup);
     lightbox.refresh();

   
    }

// Infinity scroll 

let endOfPage = false;

const debounceNotify = debounce(() => {
  Notiflix.Notify.success(refs.limitMessage);
  endOfPage = true;
},1000)

window.addEventListener('scroll', throttle(async function() {
   
  // Check if the user has reached the bottom of the page
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    // Check if there are more pages to load
    if (refs.page < refs.totalPages) {
     
      refs.page+=1;
      const result = await fetchImages(form.searchQuery.value,refs.page,refs.limit);
      renderMarkup(result.hits);
    }

  } else {
           
    if(!endOfPage) {

      debounceNotify();
    } 
    
       } 
  },300));

