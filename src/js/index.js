import Notiflix from "notiflix";
import { getPixabay } from "./fetch";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import debounce from "lodash.debounce";

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  input: document.querySelector('input'),
  btn: document.querySelector('button[type="submit"]'),
};

let page = 1;
let lastItem;
const limit = 40;

refs.input.addEventListener('input', debounce(() => {
  if (refs.input.value !== '') {
    refs.btn.style.transform = 'translateY(0)';
    refs.btn.style.opacity = '1';
  } else if (refs.input.value === '') {
    refs.btn.style.transform = 'translateY(-100%)';
    refs.btn.style.opacity = '0';
  };
}, 200));

async function imagesSearch(e) {
  e.preventDefault();
  page = 1;
  refs.gallery.innerHTML = '';

  try {
    const { value } = refs.input;
    const { data } = await getPixabay(value, page, limit);
    const { hits } = data;
    if (!hits.length || !value.trim()) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return
    };
    createMarkup(hits);

    lastItem = document.querySelector('.gallery a:last-child');
    observer.observe(lastItem);

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    console.log(error.message);
  };
};

refs.form.addEventListener('submit', imagesSearch);

function createMarkup(array) {
  const imagesList = array.reduce(((acc, item) => acc + `<a class="photo-card" href="${item.largeImageURL}"><div class="wrapper-card">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${item.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${item.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${item.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${item.downloads}
    </p>
  </div>
</div></a>
  `), '');

  refs.gallery.insertAdjacentHTML("beforeend", imagesList);
  simpleLightBox.refresh();
};

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 300,
});

async function loadMore() {
  const { value } = refs.input;
  page++
  try {
    const { data } = await getPixabay(value, page, limit);
    const { hits, totalHits } = data;
    if (refs.gallery.children.length === totalHits || totalHits - refs.gallery.children.length <= limit) {
      observer.unobserve(lastItem);
      Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
      return
    };
    observer.unobserve(lastItem);
    createMarkup(hits);
    lastItem = document.querySelector('.gallery a:last-child');
    observer.observe(lastItem);
  } catch (error) {
    console.log(error.message);
  };
};

const observer = new IntersectionObserver(fn);

function fn(entries) {
  const { isIntersecting } = entries[0];

  if (isIntersecting) {
    loadMore();
  };
};