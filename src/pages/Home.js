import React from 'react';

import { Layout } from '../layout';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import Head from './components/Head';

// demo
import map from '../images/demo/map.png';

const useStyles = makeStyles(theme => ({
    map: {
        width: '100%',
        position: "relative",
        zIndex: 1,
        opacity: 0.5,
        margin: "-300px 0px 0px 0px",
        '& > img': {
            width: '100%',
            height: 'auto'
        },
    },
}));

const Home = ({ history, location }) => {

    const classes = useStyles();

    const showIntro = (event) => {
        if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
            history.push('/intro');
        }
    }

    return (
        <Layout>

            <Head
                title="Lympahtic filariasis Prediction Maps"
                text={
                    `Welcome to the NTD Modelling Prediction Maps.
                    The predictions in this website provide guidance on
                    the impact of more frequent, longer, or higher
                    coverage treatment would have on timelines to
                    reach the WHO target.`
                }
                actionLabel={"Enter"}
                action={showIntro}
            />

            <Box component="figure" m={1} className={classes.map}>
                <img src={map} alt="map" />
            </Box>

        </Layout >
    )
}
export default Home;
