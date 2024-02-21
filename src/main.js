import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  const gallery = document.querySelector('.gallery');
  const loader = document.querySelector('.loader');
  const loadMoreBtn = document.querySelector('.button-2');
  const endMessage = document.querySelector('.end-message');
  let page = 1;
  let query = '';

  form.addEventListener('submit', onCreateFormSubmit);
  loadMoreBtn?.addEventListener('click', onLoadMoreClick);

  async function onCreateFormSubmit(event) {
    event.preventDefault();
    query = event.target.elements.query.value.trim();

    if (query === '') {
      return iziToast.error({
        message: 'Введіть вірне значення!',
        position: 'topRight',
      });
    }

    loader.style.display = 'inline-block';

    try {
      page = 1;
      gallery.innerHTML = ''; // Очищаємо галерею при новому пошуку
      await giveImages(query, page);
      smoothScrollToGallery();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loader.style.display = 'none';
      // checkLoadBtnVisibility();
    }

    event.target.reset();
  }

  async function onLoadMoreClick() {
    loader.style.display = 'inline-block';

    try {
      page += 1;
      await giveImages(query, page);
      smoothScrollToGallery();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loader.style.display = 'none';
      // checkLoadBtnVisibility();
    }
  }

  async function giveImages(nameImage, page) {
    const BASE_URL = 'https://pixabay.com/api/';
    const KEY = '?key=42272316-28c697ce0580eb37211383c7d';
    const Q = `&q=${nameImage}`;
    const IMAGE_TYPE = '&image_type=photo';
    const ORIENTATION = '&orientation=horizontal';
    const SAFESEARCH = '&safesearch=true';
    const PER_PAGE = '&per_page=15';
    const PAGE = `&page=${page}`;
    const url =
      BASE_URL +
      KEY +
      Q +
      IMAGE_TYPE +
      ORIENTATION +
      SAFESEARCH +
      PER_PAGE +
      PAGE;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      if (data && data.hits && data.hits.length > 0) {
        renderImages(data);
        updateLoadMoreButton(data.totalHits, page);
      } else {
        iziToast.error({
          message: 'No images found.',
          position: 'topRight',
        });
        hideLoader();
        loadMoreBtn?.classList.add('hidden');
        endMessage.classList.remove('hidden');
      }
    } catch (error) {
      throw error;
    }
  }

  function renderImages(data) {
    const markup = data.hits.map(templateImage).join('');
    gallery.insertAdjacentHTML('beforeend', markup);

    const galleryLinks = document.querySelectorAll('.gallery-link');
    galleryLinks.forEach(link => {
      link.setAttribute('href', link.querySelector('img').getAttribute('src'));
    });

    const lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });

    lightbox.refresh();
  }

  function templateImage({
    largeImageURL,
    webformatURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  }) {
    return `<li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
      </a>
      <div class="item-text">
        <ul>Likes<li>${likes}</li></ul>
        <ul>Views<li>${views}</li></ul>
        <ul>Comments<li>${comments}</li></ul>
        <ul>Downloads<li>${downloads}</li></ul>
      </div>
    </li>`;
  }

  function updateLoadMoreButton(totalHits, currentPage) {
    const maxPage = Math.ceil(totalHits / 15);

    if (currentPage >= maxPage) {
      loadMoreBtn.classList.add('hidden');
      endMessage.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
      endMessage.classList.add('hidden');
    }
  }

  const showLoader = () => (loader.style.display = 'inline-block');
  const hideLoader = () => (loader.style.display = 'none');

  function smoothScrollToGallery() {
    const galleryItemHeight = getGalleryItemHeight();
    window.scrollBy({
      top: galleryItemHeight * 2, // Прокрутити на дві висоти карточки галереї
      behavior: 'smooth',
    });
  }

  function getGalleryItemHeight() {
    const galleryItem = document.querySelector('.gallery-item');
    const galleryItemRect = galleryItem.getBoundingClientRect();
    return galleryItemRect.height;
  }
});
