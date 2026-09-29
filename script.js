const countriesContainer = document.querySelector('.countries-container')
const filterByRegion = document.querySelector('.filter-by-region')
const searchInput = document.querySelector('.search-container input')
const themeChanger = document.querySelector('.theme-changer')

let allCountriesData = []

// Public country dataset used because the old REST Countries v3 API is deprecated.
const COUNTRIES_DATA_URL =
  'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const POPULATION_DATA_URL =
  'https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json'

Promise.all([fetch(COUNTRIES_DATA_URL), fetch(POPULATION_DATA_URL)])
  .then(async ([countriesResponse, populationResponse]) => {
    if (!countriesResponse.ok || !populationResponse.ok) {
      throw new Error('Unable to load country data')
    }

    const [countries, populationData] = await Promise.all([
      countriesResponse.json(),
      populationResponse.json(),
    ])

    const populationMap = new Map(
      populationData.map((item) => [item.country.toLowerCase(), item.population])
    )

    allCountriesData = countries.map((country) => ({
      ...country,
      population:
        populationMap.get(country.name.common.toLowerCase()) ?? 0,
    }))

    renderCountries(allCountriesData)
  })
  .catch((error) => {
    console.error(error)
    countriesContainer.innerHTML =
      '<p class="error-message">Unable to load countries. Please check your internet connection and refresh the page.</p>'
  })

filterByRegion.addEventListener('change', (e) => {
  const region = e.target.value

  if (!region) {
    renderCountries(allCountriesData)
    return
  }

  renderCountries(allCountriesData.filter((country) => country.region === region))
})

function renderCountries(data) {
  countriesContainer.innerHTML = ''

  data.forEach((country) => {
    const countryCard = document.createElement('a')
    countryCard.classList.add('country-card')
    countryCard.href = `country.html?name=${encodeURIComponent(country.name.common)}`

    const flagUrl = country.cca2
      ? `https://flags.restcountries.com/v5/w320/${country.cca2.toLowerCase()}.png`
      : ''

    countryCard.innerHTML = `
      <img src="${flagUrl}" alt="${country.name.common} flag" />
      <div class="card-text">
        <h3 class="card-title">${country.name.common}</h3>
        <p><b>Population: </b>${(country.population ?? 0).toLocaleString('en-IN')}</p>
        <p><b>Region: </b>${country.region ?? 'N/A'}</p>
        <p><b>Capital: </b>${country.capital?.[0] ?? 'N/A'}</p>
      </div>
    `

    countriesContainer.append(countryCard)
  })
}

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim()

  const filteredCountries = allCountriesData.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm)
  )

  renderCountries(filteredCountries)
})

themeChanger.addEventListener('click', () => {
  document.body.classList.toggle('dark')
})
