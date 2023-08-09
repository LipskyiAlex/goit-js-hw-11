import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixaby-api';
import { debounce, throttle } from 'lodash';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const btn = document.querySelector('#button');

// refs
const refs = {
  failureMessage:
    'Sorry, there are no images matching your search query. Please try again.',
  limitMessage: "We're sorry, but you've reached the end of search results.",
  emptyMessage: "The field can't be empty! Please type at least 1 character",
  errorResponseMessage: 'Something went wrong, please try again later',
  page: 1,
  totalPages: 0,
  limit: 10,
  SCROLL_DEBOUNCE_INTERVAL: 300,
};

let endOfPageNotified = false; // variable in order to notify "limitMessage" only once

const lightbox = new SimpleLightbox('.gallery a'); // declare lightbox gallery

//Listeners

form.addEventListener('submit', handleSubmit);
window.addEventListener('scroll', handleButtonVisibility);
btn.addEventListener('click', handleClick);

// handeSubmit function

async function handleSubmit(e) {
  e.preventDefault(); //prevent default actions

  gallery.textContent = ''; // clear markup of the gallery container

  let query = form.searchQuery.value.trim(); // value of input text without superflours spaces

  if (query === '') {
    // check for empty value

    return Notiflix.Notify.failure(refs.emptyMessage);
  }

  try {
    const result = await fetchImages(query, refs.page, refs.limit); // fetch data from pixaby-api

    if (result.hits.length === 0) {
      //Check for empty data
      return Notiflix.Notify.warning(refs.failureMessage);
    }

    refs.totalPages = Math.ceil(result.totalHits / refs.limit); // Count total pages

    if (refs.totalPages <= refs.page && result.hits.length > 0) {
      // Check for the last page

      return Notiflix.Notify.failure(refs.limitMessage);
    }

    renderMarkup(result.hits); // Call the function to render markup

    SimpleLightbox = new SimpleLightbox('.gallery a').refresh(); // create new gallery

    Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`); // Send a notify with found image qty
  } catch (error) {
    // Catch an error

    Notiflix.Notify.failure(refs.errorResponseMessage);
  }
}

function renderMarkup(images) {
  // Render markup

  const markup = images.reduce(
    (
      html,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => {
      return (
        html +
        ` 
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
      );
    },
    ''
  );

  gallery.insertAdjacentHTML('beforeend', markup); // Insert a markup in the index.html file

  lightbox.refresh(); // refresh lightbox
}
//----------------------------------------------

// Infinity scroll

function limitNotify() {
  console.log('Limit notify function');
  if (
    !endOfPageNotified &&
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
  ) {
    Notiflix.Notify.success(refs.limitMessage);
    endOfPageNotified = true;
  }
}

window.addEventListener(
  'scroll',
  throttle(function () {
    // Check if the user has reached the bottom of the page

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      console.log(refs.page);
      console.log(refs.totalPages);

      if (refs.page < refs.totalPages) {
        // Check if there are more pages to load
        refs.page += 1;

        fetchAndRenderImages();
      } else {
        if (!endOfPageNotified) {
          limitNotify();
        }
      }
    }
  }, refs.SCROLL_DEBOUNCE_INTERVAL)
);

async function fetchAndRenderImages() {
  try {
    const result = await fetchImages(
      form.searchQuery.value,
      refs.page,
      refs.limit
    );
    renderMarkup(result.hits);
  } catch (error) {
    Notiflix.Notify.failure(refs.errorResponseMessage);
  }
}
//-----------------------------------------------

function handleButtonVisibility() {
  // Handle visiblity "to top" button

  btn.classList.toggle('show', window.scrollY > 300);
}

//----------------------------------------------

function handleClick(e) {
  // Handle click on the "to top" button

  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
