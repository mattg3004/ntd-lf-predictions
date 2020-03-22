import React from 'react'
import { observer } from 'mobx-react'

import { Layout } from '../layout'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'

import Head from './components/Head'
import Inputs from './components/Inputs'
import DiveDeeper from './components/DiveDeeper'
import SiteSections from './components/SiteSections'

import Map from '../components/Map'
import { useDataAPI } from '../hooks/stateHooks'

const useStyles = makeStyles(theme => ({
  map: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
    //top: '-300px',
    //marginBottom: '-300px',
    clear: 'both',
  },

  headLeftColumn: {
    textAlign: 'left',
  },
  headRightColumn: {
    textAlign: 'right',
    padding: theme.spacing(0, 0, 0, 2),
  },
}))

const Intro = (props) => {
  const classes = useStyles()
  const { countryData, countryFeatures } = useDataAPI()

  const playScenario = event => {
    if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
      alert('Playing')
    }
  }


  return (
    <Layout>
      <Grid container spacing={0}>
        <Grid item md={5} xs={12} className={classes.headLeftColumn}>
          <Head
            transparent={true}
            title="Lymphatic filariasis Projections"
            text={`Welcome to the NTD Modelling Projections. 
            The projections on this website provide guidance 
            on the impact of more frequent, longer or higher 
            coverate treatment would have on achieving elimination 
            as a public health problem.`}
            actionLabel={'PLAY SCENARIO'}
            action={playScenario}
          />
        </Grid>
        <Grid item md={7} xs={12} className={classes.headRightColumn}>
          <Inputs />
        </Grid>
      </Grid>
      <Grid container spacing={0}>
        <Grid item md={3} xs={12}>
            <DiveDeeper
            title="Dive deeper"
            links={[
              { to: '/about-lf', name: 'MORE ABOUT LF' },
              { to: '/trends', name: 'TRENDS' },
              { to: '/hotspots', name: 'HOTSPOTS' },
            ]}
          />
        </Grid>
        <Grid item md={9} xs={12} className={classes.headLeftColumn}>
          <Box m={1} className={classes.map}>
            <Map
              data={countryData?.data}
              features={countryFeatures}
              height={720}
              disableZoom={true}
              initialLevel={0}
            />
          </Box>
        </Grid>
        
      </Grid>

      
    </Layout>
  )
}
export default observer(Intro)
