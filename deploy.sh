#!/bin/bash
ng build --prod --aot
aws s3 cp ./dist/NaiveAirlineAppFrontend s3://naive-airline-app-frontend --recursive
