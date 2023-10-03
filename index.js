const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const mode = document.querySelector('#mode-select')

const view = {
  renderMovieCard(data) {
    let rawHTML = ``
    data.forEach((item) => {
      if (model.modes === 'card') {
        rawHTML += `
          <div class="col-sm-3">
            <div class="mb-2">
              <div class="card" style="width: 18rem;">
                <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>
          </div>
        `
      } else {
        rawHTML += `
          <div class="row g-2 border-top">
            <div class="col-9">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="col-3">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        `
      }
    })
    dataPanel.innerHTML = rawHTML
  },
  showMovieModal(id) {
    const movieTitle = document.querySelector('#movie-modal-title')
    const movieImage = document.querySelector('#movie-modal-image')
    const movieDate = document.querySelector('#movie-modal-date')
    const movieDescription = document.querySelector('#movie-modal-description')
    axios.get(INDEX_URL + id).then(response => {
      const data = response.data.results
      movieTitle.innerText = data.title
      movieDate.innerText = 'Release date: ' + data.release_date
      movieDescription.innerText = data.description
      movieImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
  },
  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / model.MOVIES_PER_PAGE)
    let rawHTML = ''
    for (let i = 1; i <= numberOfPages; i++) {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page='${i}'>${i}</a></li>
    `
      paginator.innerHTML = rawHTML
    }
  },

}

const model = {
  movies: [],
  filteredMovies: [],
  MOVIES_PER_PAGE: 12,
  modes: 'card',
  pages: 1
}

const controller = {}

const utility = {
  getMoviesByPage(page) {
    const data = model.filteredMovies.length ? model.filteredMovies : model.movies
    const startIndex = (page - 1) * model.MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + model.MOVIES_PER_PAGE)
  },
  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = model.movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已在收藏清單中!')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  },
}

// 監聽器-搜尋列
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  model.filteredMovies = model.movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (model.filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  view.renderPaginator(model.filteredMovies.length)
  view.renderMovieCard(utility.getMoviesByPage(1))
})
// 監聽器-秀modal、新增最愛
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    view.showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    utility.addToFavorite(Number(event.target.dataset.id))
  }
})
// 監聽器-頁數
paginator.addEventListener('click', function onPaginatorClicked(e) {
  model.pages = Number(e.target.dataset.page)
  view.renderMovieCard(utility.getMoviesByPage(model.pages))
})
// 監聽器-mode
mode.addEventListener('click', function selectMode(e) {
  if (e.target.matches('.btn-card-mode')) {
    model.modes = 'card'
    view.renderMovieCard(utility.getMoviesByPage(model.pages))
  } else if (e.target.matches('.btn-list-mode')) {
    model.modes = 'list'
    view.renderMovieCard(utility.getMoviesByPage(model.pages))
  }
})

axios.get(INDEX_URL)
  .then(response => {
    model.movies.push(...response.data.results)
    view.renderPaginator(model.movies.length)
    view.renderMovieCard(utility.getMoviesByPage(1))
  })