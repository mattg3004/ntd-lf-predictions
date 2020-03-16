import React from 'react';

import { Layout } from '../layout';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Head from './components/Head';
import Inputs from './components/Inputs';
import DiveDeeper from './components/DiveDeeper';


// demo
import map from '../images/demo/map.png';

const useStyles = makeStyles(theme => ({
    map: {
        width: '100%',
        position: "relative",
        zIndex: 1,
        top: "-300px",
        marginBottom: '-300px',
        clear: 'both',
        '& > img': {
            width: '100%',
            height: 'auto'
        },
        '&:after': {
            content: "''",
            display: 'block',
            width: '100%',
            height: '100%',
            background: 'red'
        },
    },

    headLeftColumn: {
        textAlign: 'left'
    },
    headRightColumn: {
        textAlign: 'right',
        padding: theme.spacing(2),
    },

}));

const Intro = ({ history, location }) => {

    const classes = useStyles();

    const playScenario = (event) => {
        if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
            alert('Playing');
        }
    }

    return (
        <Layout>

            <Grid container spacing={0}>
                <Grid item md={5} xs={12} className={classes.headLeftColumn}>
                    <Head
                        transparent={true}
                        title="Lympahtic filariasis Predicted outcome 2030"
                        text={
                            `Welcome to the NTD Modelling Prediction Maps.
                            The predictions in this website provide guidance on
                            the impact of more frequent, longer, or higher
                            coverage treatment would have on timelines to
                            reach the WHO target.`
                        }
                        subTitle={"Current WHO guidelines"}
                        actionLabel={"PLAY SCENARIO"}
                        action={playScenario}
                    />
                </Grid>
                <Grid item md={7} xs={12} className={classes.headRightColumn}>
                    <Inputs />
                </Grid>
            </Grid>


            <Box component="figure" m={1} className={classes.map}>
                <img src={map} alt="map" />
            </Box>

            <DiveDeeper
                title="Dive deeper"
                links={[{ to: '/trends', name: 'TRENDS' }, { to: '/hot-spots', name: 'PROBLEM AREAS' }]}
            />


        </Layout >
    )
}
export default Intro;
