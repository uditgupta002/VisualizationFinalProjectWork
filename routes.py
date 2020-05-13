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


def init():
    global main_data
    logger.info('Starting initialization')
    main_data = pd.read_csv('./data/updated_result.csv')
    logger.info('Finished Initialization')

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
    main_output_keys = ['country', 'age_group', 'gender', 'education', 'job_title', 'primary_tool_used']
    summary_output_keys = ['current_salary', 'size_of_company', 'years_in_ml']

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
        output_json[summary_key] = filtered_data[summary_key].value_counts().idxmax()

    # Adding some supplemental summary data as well
    output_json['total_responders'] = filtered_data.shape[0]
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
