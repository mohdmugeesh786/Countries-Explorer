const countryName = new URLSearchParams(location.search).get('name')
const flagImage = document.querySelector('.country-details img')
const countryNameH1 = document.querySelector('.country-details h1')
const nativeName = document.querySelector('.native-name')
const population = document.querySelector('.population')
const region = document.querySelector('.region')
const subRegion = document.querySelector('.sub-region')
const capital = document.querySelector('.capital')
const topLevelDomain = document.querySelector('.top-level-domain')
const currencies = document.querySelector('.currencies')
const languages = document.querySelector('.languages')
const borderCountries = document.querySelector('.border-countries')

const COUNTRIES_DATA_URL =
  'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const POPULATION_DATA_URL =
  'https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json'

if (!countryName) {
  window.location.href = 'index.html'
} else {
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

      const country = countries.find(
        (item) => item.name.common.toLowerCase() === countryName.toLowerCase()
      )

      if (!country) throw new Error('Country not found')

      const countryPopulation =
        populationMap.get(country.name.common.toLowerCase()) ?? 0

      flagImage.src = country.cca2
        ? `https://flags.restcountries.com/v5/w320/${country.cca2.toLowerCase()}.png`
        : ''
      flagImage.alt = `${country.name.common} flag`
      countryNameH1.innerText = country.name.common
      population.innerText = countryPopulation.toLocaleString('en-IN')
      region.innerText = country.region || 'N/A'
      subRegion.innerText = country.subregion || 'N/A'
      capital.innerText = country.capital?.[0] || 'N/A'
      topLevelDomain.innerText = country.tld?.join(', ') || 'N/A'

      if (country.name.native) {
        const nativeNames = Object.values(country.name.native)
        nativeName.innerText = nativeNames[0]?.common || country.name.common
      } else {
        nativeName.innerText = country.name.common
      }

      currencies.innerText = country.currencies
        ? Object.values(country.currencies)
            .map((currency) => currency.name)
            .join(', ')
        : 'N/A'

      languages.innerText = country.languages
        ? Object.values(country.languages).join(', ')
        : 'N/A'

      if (country.borders?.length) {
        country.borders.forEach((border) => {
          const borderCountry = countries.find((item) => item.cca3 === border)

          if (borderCountry) {
            const borderCountryTag = document.createElement('a')
            borderCountryTag.innerText = borderCountry.name.common
            borderCountryTag.href = `country.html?name=${encodeURIComponent(
              borderCountry.name.common
            )}`
            borderCountries.append(borderCountryTag)
          }
        })
      } else {
        borderCountries.innerHTML += 'No bordering countries'
      }
    })
    .catch((error) => {
      console.error(error)
      countryNameH1.innerText = 'Country not found'
    })
}
