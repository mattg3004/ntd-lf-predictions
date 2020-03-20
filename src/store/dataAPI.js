import { computed, decorate } from 'mobx'
import {
  mapValues,
  groupBy,
  keyBy,
  flow,
  values,
  flatten,
  entries,
  map,
  round,
  keys,
  filter,
  mapKeys,
  omit,
  pickBy as pickByFP,
} from 'lodash/fp'
import {
  sortBy,
  pick,
  merge,
  min,
  max,
  zip,
  mapValues as mapValuesS,
} from 'lodash'
import { interpolateReds, scaleSequential, color } from 'd3'

// helper that groups columns of the csv into object properties
const groupProps = (obj, pattern) =>
  flow(
    pickByFP((value, key) => new RegExp(pattern).test(key)),
    mapKeys(key => key.replace(/[^\d]/g, ''))
  )(obj)

const roundPrevalence = p => round(p * 100, 2)

function addRankingAndStats(data) {
  const dataMap = keyBy('id')(data)

  // create ranking
  const rankings = flow(
    values,
    map(({ prevalence, id }) =>
      entries(prevalence).map(([year, prevalence]) => ({
        year,
        prevalence,
        id,
      }))
    ),
    flatten,
    // group all values by year
    groupBy('year'),
    // add year and rank
    mapValues(v =>
      sortBy(v, ['prevalence', 'id']).map((x, i) => ({
        ...x,
        year: +x.year,
        rank: i + 1,
      }))
    ),
    // break-up grouping by year
    values,
    flatten,
    // build rank series
    groupBy('id'),
    mapValues(ranks => map(omit('id'))(ranks))
  )(dataMap)

  // add rankings to entries
  const processed = mapValues(x => ({ ...x, ranks: rankings[x.id] }))(dataMap)

  // create stats
  const extremes = flow(
    values,
    map(({ prevalence }) => {
      const pValues = values(prevalence)
      return [min(pValues), max(pValues)]
    })
  )(processed)

  const [minN, maxN] = zip(...extremes)

  const stats = {
    prevalence: { min: min(minN) ?? 0, max: max(maxN) ?? 0 },
  }

  return { data: processed, stats }
}

function transformRow({ data, relations, key }) {
  const groupRelByKey = groupBy(key)(relations)
  return flow(
    map(row => {
      const { [key]: id, Population } = row
      const meta = groupRelByKey[id][0]

      // retrieve entity names from relations
      const name =
        key === 'Country'
          ? meta.CountryName
          : key === 'StateCode'
          ? meta.StateName
          : meta.IUName

      const probability = groupProps(row, 'elimination')
      const prev = groupProps(row, 'Prev_')
      const lower = groupProps(row, 'Lower')
      const upper = groupProps(row, 'Upper')

      const related = groupRelByKey[id]
      const relatedCountries = flow(groupBy('Country'), keys)(related)
      const relatedStates = flow(groupBy('StateCode'), keys)(related)
      const relatedIU = flow(groupBy('IUID'), keys)(related)

      const enhanced = {
        id,
        name,
        population: round(Population, 0),
        endemicity: row.Endemicity,
        prevalence: mapValues(roundPrevalence)(prev),
        probability,
        lower,
        upper,
        relatedCountries,
        relatedStates,
        relatedIU,
      }
      return enhanced
    })
  )(data)
}

function mergeFeatures(data, featureCollection, key) {
  const { data: d, stats } = data

  // TODO: add bins
  const colorScale = scaleSequential(interpolateReds)
    .domain([0, stats.prevalence.max])
    .nice(5)

  const ticks = colorScale
    .ticks(5)
    .map(value => ({ value, color: colorScale(value) }))

  const features = featureCollection.features.map(feature => {
    // get IU id
    const id = feature.properties[key]
    const prevalenceOverTime = d[id]?.prevalence ?? {}

    // get color from scale if prevalence value available
    const colorsByYear = mapValuesS(prevalenceOverTime, p_prevalence =>
      isFinite(p_prevalence) ? color(colorScale(p_prevalence)).hex() : null
    )

    return merge({}, feature, {
      properties: {
        ...colorsByYear,
      },
    })
  })

  return { type: 'FeatureCollection', features }
}

class DataAPI {
  constructor(rootStore) {
    this.dataStore = rootStore.dataStore
    this.uiState = rootStore.uiState
  }

  // filter countries by endemicity and regime
  get filteredCountries() {
    const { countries } = this.dataStore
    const { endemicity, regime } = this.uiState

    if (countries) {
      return filter(
        !!endemicity
          ? { Regime: regime, Endemicity: endemicity }
          : { Regime: regime }
      )(countries)
    }

    return null
  }

  //   filter states by endemicity and regime
  get filteredStates() {
    const { states } = this.dataStore
    const { endemicity, regime } = this.uiState

    if (states) {
      return filter(
        !!endemicity
          ? { Regime: regime, Endemicity: endemicity }
          : { Regime: regime }
      )(states)
    }

    return null
  }

  // add relations to countries
  get filteredCountriesWithMeta() {
    const countries = this.filteredCountries
    const { relations } = this.dataStore

    if (countries && relations) {
      return transformRow({ data: countries, relations, key: 'Country' })
    }

    return null
  }

  // add relations to states
  get filteredStatesWithMeta() {
    const states = this.filteredStates
    const { relations } = this.dataStore

    if (states && relations) {
      return transformRow({ data: states, relations, key: 'StateCode' })
    }

    return null
  }

  get countryData() {
    const countries = this.filteredCountriesWithMeta
    const { relations } = this.dataStore

    if (countries && relations) {
      return addRankingAndStats(countries)
    }

    return null
  }

  get stateData() {
    const states = this.filteredStatesWithMeta
    const { relations } = this.dataStore

    if (states && relations) {
      return addRankingAndStats(states)
    }

    return null
  }

  get stateByCountryData() {
    const states = this.filteredStatesWithMeta
    const { relations } = this.dataStore

    if (states && relations) {
      return flow(
        groupBy(x => x.relatedCountries[0]),
        mapValues(addRankingAndStats)
      )(states)
    }

    return null
  }

  get iuData() {
    //   FIXME: important!
    //   TODO: adapt to stateData() / countryData()
    const { ius, relations } = this.dataStore

    if (ius && relations) {
      return addRankingAndStats(ius)
    }

    return null
  }

  get countryFeatures() {
    const featureCollection = this.dataStore.featuresLevel0
    const data = this.countryData

    if (featureCollection && data) {
      return mergeFeatures(data, featureCollection, 'ADMIN0ISO3')
    }

    return { type: 'FeatureCollection', features: [] }
  }

  get stateFeatures() {
    const featureCollection = this.dataStore.featuresLevel1
    const data = this.stateData

    if (featureCollection && data) {
      return mergeFeatures(data, featureCollection, 'ADMIN1ID')
    }

    return { type: 'FeatureCollection', features: [] }
  }

  get iuFeatures() {
    const featureCollection = this.dataStore.featuresLevel2
    const data = this.iuData

    if (featureCollection && data) {
      return mergeFeatures(data, featureCollection, 'IU_ID')
    }

    return { type: 'FeatureCollection', features: [] }
  }
}

decorate(DataAPI, {
  countryData: computed,
  stateData: computed,
  stateByCountryData: computed,
  iuData: computed,
  countryFeatures: computed,
  stateFeatures: computed,
  iuFeatures: computed,
  filteredCountries: computed,
  filteredStates: computed,
  filteredCountriesWithMeta: computed,
  filteredStatesWithMeta: computed,
})

export default DataAPI