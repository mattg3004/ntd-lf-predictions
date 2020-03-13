import React from 'react';

import { Layout } from '../layout';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

import Head from './components/Head';

const useStyles = makeStyles(theme => ({
}));

const Simulator = ({ history, location }) => {

    const classes = useStyles();


    return (
        <Layout>

            <Head
                transparent={true}
                title="Lympahtic filariasis Prevalence Simulator"
            />

        </Layout >
    )
}
export default Simulator;
