from flask import Blueprint, request, render_template, make_response
from concurrent.futures import ThreadPoolExecutor
import multiprocessing

import json
import logging
import pandas as pd
import numpy as np

import os

routes = Blueprint('routes', __name__, template_folder='templates')
logger = logging.getLogger(__name__)

main_data = None
country_cont_mapping = None
cont_dict = {
    'United States of America': 'North America',
    'Russia': 'Asia',
    'Other': 'Other',
    'South Korea': 'Asia',
    'United Kingdom of Great Britain and Northern Ireland': 'Europe',
    'Czech Republic': 'Europe',
    'Hong Kong (S.A.R.)': 'Asia',
    'Taiwan': 'Asia',
    'Viet Nam': 'Asia',
    'Republic of Korea': 'Asia',
    'Iran, Islamic Republic of...': 'Asia',
}


def init():
    global main_data
    global country_cont_mapping
    logger.info('Starting initialization')
    main_data = pd.read_csv('./data/updated_result.csv')
    cont_df = pd.read_csv('./data/conts.csv')
    main_data = pd.merge(main_data, cont_df[['Continent', 'Country']], how='left', left_on='country',
                         right_on='Country')
    main_data['Continent'] = main_data.apply(lambda row: fix(row), axis=1)
    main_data = main_data.drop('Country', axis=1)
    country_cont_mapping = main_data.groupby('country').first()['Continent']
    logger.info('Finished Initialization')


def fix(row):
    if (row['Continent'] is np.NAN):
        return cont_dict[row['country']]
    else:
        return row['Continent']


@routes.route('/')
def dashboard():
    return render_template('index.html')


# API endpoint to get filtered data as per the given list of filters
@routes.route('/data', methods=['POST'])
def get_data():
    try:
        logger.info('Received request for data')

        # Get filter list sent by frontend
        filters_dict = request.get_json()
        logger.info('Received filter list : ' + str(filters_dict))

        # Filter the main data list as per the asked filters
        query_string = generate_query_string(filters_dict)

        # Generate response data to be sent to frontend
        response_data = prepare_data(query_string)

        logger.info('Data preparation completed successfully. Returning')
        resp = make_response(response_data, 200)
        resp.headers['Content-Type'] = 'application/json'
        return resp
    except Exception as e:
        logger.error('An exception occurred during processing', exc_info=True)
        resp = make_response({'success': False}, 404)
        resp.headers['Content-Type'] = 'application/json'
        return resp


def prepare_data(query_string):
    main_output_keys = ['age_group', 'gender', 'education', 'job_title']
    summary_output_keys = ['current_salary', 'size_of_company', 'years_in_ml', 'primary_tool_used']

    output_json = {}
    if (query_string is None):
        filtered_data = main_data
    else:
        filtered_data = main_data[query_string]

    # Prepare data for main views
    for main_key in main_output_keys:
        output_json[main_key] = filtered_data[main_key].value_counts(normalize=True).to_dict()

    # Prepare data for summary views
    for summary_key in summary_output_keys:
        try:
            output_json[summary_key] = filtered_data[summary_key].value_counts().idxmax()
        except Exception:
            output_json[summary_key] = 0.0

    # Prepare word cloud data
    viz_frameworks_dict = {}
    viz_frameworks = filtered_data[filtered_data['viz_frameworks'].notnull()]['viz_frameworks']
    for value_list in viz_frameworks:
        for value in value_list.split(','):
            if (value.strip() == ''): continue
            viz_frameworks_dict[value.strip()] = viz_frameworks_dict.get(value.strip(), 0) + 1

    output_json['viz_frameworks'] = viz_frameworks_dict

    # Prepare word cloud data
    ml_frameworks_dict = {}
    ml_frameworks = filtered_data[filtered_data['ml_frameworks'].notnull()]['ml_frameworks']
    for value_list in ml_frameworks:
        for value in value_list.split(','):
            if (value.strip() == ''): continue
            ml_frameworks_dict[value.strip()] = ml_frameworks_dict.get(value.strip(), 0) + 1

    output_json['ml_frameworks'] = ml_frameworks_dict

    # Adding some supplemental summary data as well
    output_json['total_responders'] = filtered_data.shape[0]
    output_json['country'] = pd.merge(filtered_data.country.value_counts(normalize=True),
                                      country_cont_mapping,
                                      left_index=True,
                                      right_index=True) \
        .reset_index() \
        .rename({'index': 'country', 'country': 'value'}, axis=1) \
        .to_dict(orient='records')
    return json.dumps(output_json)


def generate_query_string(filters_dict):
    query_string = None

    if (filters_dict is None or len(filters_dict) == 0):
        return query_string

    for filter_key in filters_dict:
        cond = main_data[filter_key].isin(filters_dict[filter_key])
        if (query_string is None):
            query_string = cond
        else:
            query_string = query_string & cond
    return query_string
