const cardsWrapper = document.querySelector('.cards--wrapper');
const searchBtn = document.querySelector('.search--button');
const form = document.querySelector('.search--form');
const searchField = document.querySelector('#query');
const links = document.querySelectorAll('.link');
const movieGenres = document.querySelectorAll('.movie--genre');
const tvGenres = document.querySelectorAll('.tv--genre');
const movieImages = document.querySelectorAll('.card--image');
const movieNames = document.querySelectorAll('.card--heading');
const wrapper = document.querySelector('.wrapper');
const exitBtn = document.querySelector('.exit');
const mobileMenu = document.querySelector('.navigation-link--wrapper');

// Destructuring
const [homeBtn, moviesBtn, genreBtn, seriesBtn, seriesGenreBtn] = links;

// APIs
const API_LINK_MOVIE =
  'https://api.themoviedb.org/3/discover/movie?api_key=23d1762f10bbb95408b360e74f7b3ac0';
const API_GENRE_MOVIE =
  'https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=23d1762f10bbb95408b360e74f7b3ac0';
const API_GENRE_TV =
  'https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=23d1762f10bbb95408b360e74f7b3ac0';
const API_TRENDING =
  'https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=23d1762f10bbb95408b360e74f7b3ac0';
const API_LINK_TV =
  'https://api.themoviedb.org/3/discover/tv?api_key=23d1762f10bbb95408b360e74f7b3ac0';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API =
  'https://api.themoviedb.org/3/search/multi?api_key=23d1762f10bbb95408b360e74f7b3ac0&query=';
const MOVIE_DETAILS_API =
  'https://api.themoviedb.org/3/movie/77246?language=en-US&api_key=23d1762f10bbb95408b360e74f7b3ac0';

let genres;
// Functions
async function fetchMovies(url) {
  try {
    cardsWrapper.innerHTML = '';
    // Fetching Movie Genres
    const fetchingMovGenres = await fetch(API_GENRE_MOVIE);
    const fetchedMovGenres = await fetchingMovGenres.json();

    // Fetching Tv Genres
    const fetchingTvGenres = await fetch(API_GENRE_TV);
    const fetchedTvGenres = await fetchingTvGenres.json();

    // Global genre array
    genres = [...fetchedMovGenres.genres, ...fetchedTvGenres.genres];

    // Videos fetch
    let data = await fetch(url);
    let resultData = await data.json();
    let videosResults = resultData.results;
    videosResults.forEach((video) => {
      const videoCard = document.createElement('article');
      videoCard.classList.add('card');

      const videoImage = document.createElement('img');
      videoImage.src = video.poster_path
        ? IMG_PATH + video.poster_path
        : './images/poster-holder.jpg';
      videoImage.classList.add('card--image');

      const videoTitleWrapper = document.createElement('header');
      videoTitleWrapper.classList.add('card-title-wrapper');

      const videoTitle = document.createElement('h3');
      videoTitle.textContent = video.name ? video.name : video.title;
      videoTitle.classList.add('card--heading');

      const idHolder = document.createElement('span');
      idHolder.classList.add('hidden');

      videoCard.append(videoImage);
      videoTitleWrapper.append(videoTitle);
      videoCard.append(videoTitleWrapper);
      cardsWrapper.append(videoCard);

      // Event Listener
      videoImage.addEventListener('click', () => {
        fetchDetails(video);
      });
      videoTitle.addEventListener('click', () => {
        fetchDetails(video);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function fetchDetails(video) {
  try {
    let type = video.name ? 'tv' : 'movie';

    // Fetch details
    let data = await fetch(
      `https://api.themoviedb.org/3/${type}/${video.id}?language=en-US&api_key=23d1762f10bbb95408b360e74f7b3ac0`
    );
    let videoData = await data.json();

    document.querySelector('.video--details').style.background = `url(${
      IMG_PATH + videoData.backdrop_path
    })`;

    document.querySelector('.video--details--image').src = `${
      IMG_PATH + videoData.poster_path
    }`;

    let year = `${
      video.release_date ? video.release_date : video.first_air_date
    }`
      .split('-')
      .join(',');
    year = new Date(year);
    let genresArray = videoData.genres.map((genre) => genre.name);
    let hours = String(Math.trunc(videoData.runtime / 60));
    let min = String(videoData.runtime - hours * 60);
    let videoName = video.name ? video.name : video.title;

    document.querySelector(
      '.video--title'
    ).innerHTML = `${videoName} <span class="year">(${year.getFullYear()})</span>`;

    document.querySelector(
      '.video--genres-and-release-date'
    ).innerHTML = `${genresArray.join(', ')} | ${new Intl.DateTimeFormat(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    ).format(new Date(year))} ${
      videoData.title ? `| ${hours}hr ${min}min` : ''
    }`;

    document.querySelector('.video--summary').textContent = videoData.overview;

    // Fetch credits
    let newData = await fetch(
      `https://api.themoviedb.org/3/${type}/${video.id}/credits?language=en-US&api_key=23d1762f10bbb95408b360e74f7b3ac0`
    );
    let videoCredits = await newData.json();
    let crew = videoCredits.crew
      .slice()
      .sort((a, b) => b.popularity - a.popularity);
    let director = crew.find(
      (member) => member.job == 'Executive Producer' || member.job == 'Director'
    ).name;

    document.querySelector(
      '.video--director'
    ).innerHTML = `<span class="video--director--heading">${
      video.name ? 'Creator' : 'Director'
    }:</span> ${director}`;
    document.querySelector('.video--cast').innerHTML = '';

    videoCredits.cast.forEach((actor) => {
      const actorCard = document.createElement('div');
      actorCard.classList.add('video--actor--card');

      const actorImage = document.createElement('img');
      actorImage.classList.add('actor--image');

      const actorNameWrapper = document.createElement('header');
      actorNameWrapper.classList.add('video--actor--name--wrapper');

      const actorName = document.createElement('h3');
      actorName.classList.add('video--actor--name');

      const actorScreenName = document.createElement('p');
      actorScreenName.classList.add('video--actor--screen-name');

      // Setting value
      actorImage.src = IMG_PATH + actor.profile_path;
      actorName.textContent = actor.name;
      actorScreenName.textContent = actor.character;

      // Appending
      actorNameWrapper.append(actorName);
      actorNameWrapper.append(actorScreenName);

      if (!actorImage.src.endsWith('null')) {
        actorCard.append(actorImage);
        actorCard.append(actorNameWrapper);
        document.querySelector('.video--cast').append(actorCard);
      }
    });
    let title = videoName.toLowerCase().split(' ').join('-');
    document.querySelector(
      '.dlink'
    ).href = `https://moviesmod.dev/download-${title}`;

    wrapper.style.display = 'flex';
  } catch (error) {}
}

function search(e) {
  e.preventDefault();
  fetchMovies(SEARCH_API + searchField.value);
  searchField.value = '';
}

function closeVideoDetails() {
  wrapper.style.display = 'none';
}

function closeMobileMenu() {
  mobileMenu.style.display = 'none';
}

fetchMovies(API_TRENDING);

// Event listeners
form.addEventListener('submit', search);

searchBtn.addEventListener('click', search);
homeBtn.addEventListener('click', () => {
  fetchMovies(API_TRENDING);
});
moviesBtn.addEventListener('click', () => {
  fetchMovies(API_LINK_MOVIE);
});
seriesBtn.addEventListener('click', () => {
  fetchMovies(API_LINK_TV);
});

movieGenres.forEach((genre) => {
  genre.addEventListener('click', () => {
    let currentGenre = genre.textContent;
    let genreId = String(
      genres.find((genre) => new RegExp(currentGenre, 'i').test(genre.name)).id
    );
    fetchMovies(
      `https://api.themoviedb.org/3/discover/movie?api_key=23d1762f10bbb95408b360e74f7b3ac0&with_genres=${genreId}`
    );
    setTimeout(closeMobileMenu, 100);
  });
});

tvGenres.forEach((genre) => {
  genre.addEventListener('click', () => {
    let currentGenre = genre.textContent;
    let genreId = String(
      genres.find((genre) => new RegExp(currentGenre, 'i').test(genre.name)).id
    );
    fetchMovies(
      `https://api.themoviedb.org/3/discover/tv?api_key=23d1762f10bbb95408b360e74f7b3ac0&with_genres=${genreId}`
    );
    setTimeout(closeMobileMenu, 100);
  });
});

wrapper.addEventListener('click', closeVideoDetails);
exitBtn.addEventListener('click', closeVideoDetails);
document.addEventListener('keydown', (e) => {
  if (e.key == 'Escape' && wrapper.style.display == 'flex') {
    closeVideoDetails();
  }
});

document.querySelector('.menu').addEventListener('click', () => {
  mobileMenu.style.display = 'block';
});

document.querySelector('.movie--genre-holder').addEventListener('click', () => {
  if (mobileMenu.style.display == 'block') {
    document.querySelector('.movie--genre--wrapper').classList.toggle('block');
  }
});

document.querySelector('.tv--genre-holder').addEventListener('click', () => {
  if (mobileMenu.style.display == 'block') {
    document.querySelector('.tv--genre--wrapper').classList.toggle('block');
  }
});

document.querySelector('.exit-mobile').addEventListener('click', () => {
  closeMobileMenu();
});
