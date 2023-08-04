import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

// refs
const refs = {
    
    KEY: '38590666-b4e4facc0390580085af70521',
    baseUrl: 'https://pixabay.com/api/',
    failureMessage:  "Sorry, there are no images matching your search query. Please try again.",
    gallery: document.querySelector(".gallery"),
    form: document.querySelector(".search-form"),
    loadMore: document.querySelector(".load-more"),
    page:1,
    totalPages:0
}

//Listeners 

refs.form.addEventListener("submit", handleSubmit);
// refs.loadMore.addEventListener("submit",)
   
// Фетчим фото по сабмиту

function handleSubmit(e) {
  refs.page = 1;
  e.preventDefault();
  fetchPhotos()
  .then(result =>result.hits.length===0?Notiflix.Notify.failure(refs.failureMessage):renderMarkup(result.hits))
.catch(error => Notiflix.Notify.failure(error));
   refs.page+=1;
   refs.form.searchQuery.value = "";
}

async function fetchPhotos () {
     
  const response =  await fetch(`${refs.baseUrl}?key=${refs.KEY}&q=${refs.form.searchQuery.value}&image_type=photo&orientation=horizontal&safesearch=true&page=${refs.page}&per_page=3`);
  refs.page+=1;
  return response.json();
  
}

// Рендерим разметку
function renderMarkup(images) {

        refs.gallery.innerHTML = images.reduce((acum,{webformatURL,largeImageURL,tags,likes,views,comments,downloads} ) => {
         return acum+`<div class="photo-card">
         <img src="${webformatURL}" alt="${tags}" width="300px" loading="lazy" />
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
       </div>`
     },"")   
}